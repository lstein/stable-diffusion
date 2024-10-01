from typing import overload

import gguf
import torch

from invokeai.backend.quantization.gguf.utils import (
    DEQUANTIZE_FUNCTIONS,
    TORCH_COMPATIBLE_QTYPES,
    dequantize,
)

# Ranking of precision preference for different dtypes.
# When applying an operation involving a GGMLTensor and other non-GGMLTensors, we will run the operation at the
# highest precision of the non-GGMLTensors.
DTYPE_PRECISION_RANK = {
    torch.float64: 0,
    torch.float32: 1,
    torch.bfloat16: 2,  # Note: We prefer bfloat16 over float16 for our typical use cases.
    torch.float16: 3,
    torch.float8_e4m3fn: 4,
}


def choose_highest_precision_dtype(dtypes: list[torch.dtype]) -> torch.dtype:
    if len(dtypes) == 0:
        # TODO(ryand): If we ever hit this case, there's a good chance we'll want to allow the user to specify the
        # desired compute dtype.
        return torch.float32
    return min(dtypes, key=lambda dtype: DTYPE_PRECISION_RANK[dtype])


def dequantize_and_run(func, args, kwargs):
    """A helper function for running math ops on GGMLTensor inputs.

    Dequantizes the inputs, and runs the function.
    """
    # Determine which precision to run the operation at.
    all_input_dtypes = [a.dtype for a in args if type(a) is torch.Tensor] + [
        v.dtype for v in kwargs.values() if type(v) is torch.Tensor
    ]
    compute_dtype = choose_highest_precision_dtype(all_input_dtypes)

    dequantized_args = [
        a.get_dequantized_tensor(dtype=compute_dtype) if hasattr(a, "get_dequantized_tensor") else a for a in args
    ]
    dequantized_kwargs = {
        k: v.get_dequantized_tensor(dtype=compute_dtype) if hasattr(v, "get_dequantized_tensor") else v
        for k, v in kwargs.items()
    }
    return func(*dequantized_args, **dequantized_kwargs)


def apply_to_quantized_tensor(func, args, kwargs):
    """A helper function to apply a function to a quantized GGML tensor, and re-wrap the result in a GGMLTensor.

    Assumes that the first argument is a GGMLTensor.
    """
    # We expect the first argument to be a GGMLTensor, and all other arguments to be non-GGMLTensors.
    ggml_tensor = args[0]
    assert isinstance(ggml_tensor, GGMLTensor)
    assert all(not isinstance(a, GGMLTensor) for a in args[1:])
    assert all(not isinstance(v, GGMLTensor) for v in kwargs.values())

    new_data = func(ggml_tensor.quantized_data, *args[1:], **kwargs)

    if new_data.dtype != ggml_tensor.quantized_data.dtype:
        # This is intended to catch calls such as `.to(dtype-torch.float32)`, which are not supported on GGMLTensors.
        raise ValueError("Operation changed the dtype of GGMLTensor unexpectedly.")

    return GGMLTensor(new_data, ggml_tensor._ggml_quantization_type, ggml_tensor._tensor_shape)


GGML_TENSOR_OP_TABLE = {
    # Ops to run on the quantized tensor.
    torch.ops.aten.detach.default: apply_to_quantized_tensor,  # pyright: ignore
    torch.ops.aten._to_copy.default: apply_to_quantized_tensor,  # pyright: ignore
    # Ops to run on dequantized tensors.
    torch.ops.aten.t.default: dequantize_and_run,  # pyright: ignore
    torch.ops.aten.addmm.default: dequantize_and_run,  # pyright: ignore
    torch.ops.aten.mul.Tensor: dequantize_and_run,  # pyright: ignore
}


class GGMLTensor(torch.Tensor):
    """A torch.Tensor sub-class holding a quantized GGML tensor.

    The underlying tensor is quantized, but the GGMLTensor class provides a dequantized view of the tensor on-the-fly
    when it is used in operations.
    """

    @staticmethod
    def __new__(cls, data: torch.Tensor, ggml_quantization_type: gguf.GGMLQuantizationType, tensor_shape: torch.Size):
        # Type hinting is not supported for torch.Tensor._make_wrapper_subclass, so we ignore the errors.
        return torch.Tensor._make_wrapper_subclass(  # pyright: ignore
            cls,
            data.shape,
            dtype=data.dtype,
            layout=data.layout,
            device=data.device,
            strides=data.stride(),
            storage_offset=data.storage_offset(),
        )

    def __init__(self, data: torch.Tensor, ggml_quantization_type: gguf.GGMLQuantizationType, tensor_shape: torch.Size):
        self.quantized_data = data
        self._ggml_quantization_type = ggml_quantization_type
        # The dequantized shape of the tensor.
        self._tensor_shape = tensor_shape

    def __repr__(self, *, tensor_contents=None):
        return f"GGMLTensor(type={self._ggml_quantization_type.name}, dequantized_shape=({self._tensor_shape})"

    @overload
    def size(self, dim: None = None) -> torch.Size: ...

    @overload
    def size(self, dim: int) -> int: ...

    def size(self, dim: int | None = None):
        """Return the size of the tensor after dequantization. I.e. the shape that will be used in any math ops."""
        if dim is not None:
            return self._tensor_shape[dim]
        return self._tensor_shape

    @property
    def shape(self) -> torch.Size:  # pyright: ignore[reportIncompatibleVariableOverride] pyright doesn't understand this for some reason.
        """The shape of the tensor after dequantization. I.e. the shape that will be used in any math ops."""
        return self.size()

    @property
    def quantized_shape(self) -> torch.Size:
        """The shape of the quantized tensor."""
        return self.quantized_data.shape

    def requires_grad_(self, mode: bool = True) -> torch.Tensor:
        """The GGMLTensor class is currently only designed for inference (not training). Setting requires_grad to True
        is not supported. This method is a no-op.
        """
        return self

    def get_dequantized_tensor(self, dtype: torch.dtype):
        """Return the dequantized tensor.

        Args:
            dtype: The dtype of the dequantized tensor.
        """
        if self._ggml_quantization_type in TORCH_COMPATIBLE_QTYPES:
            return self.quantized_data.to(dtype)
        elif self._ggml_quantization_type in DEQUANTIZE_FUNCTIONS:
            # TODO(ryand): Look into how the dtype param is intended to be used.
            return dequantize(
                data=self.quantized_data, qtype=self._ggml_quantization_type, oshape=self._tensor_shape, dtype=None
            ).to(dtype)
        else:
            # There is no GPU implementation for this quantization type, so fallback to the numpy implementation.
            new = gguf.quants.dequantize(self.quantized_data.cpu().numpy(), self._ggml_quantization_type)
            return torch.from_numpy(new).to(self.quantized_data.device, dtype=dtype)

    @classmethod
    def __torch_dispatch__(cls, func, types, args, kwargs):
        # We will likely hit cases here in the future where a new op is encountered that is not yet supported.
        # The new op simply needs to be added to the GGML_TENSOR_OP_TABLE.
        if func in GGML_TENSOR_OP_TABLE:
            return GGML_TENSOR_OP_TABLE[func](func, args, kwargs)
        return NotImplemented
