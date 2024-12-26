import pytest
import torch

from invokeai.backend.model_manager.load.model_cache.torch_module_autocast.custom_modules.custom_invoke_linear_nf4 import (
    CustomInvokeLinearNF4,
)
from invokeai.backend.quantization.bnb_nf4 import InvokeLinearNF4


def build_linear_nf4_layer():
    if not torch.cuda.is_available():
        pytest.skip("CUDA is not available")

    torch.manual_seed(1)

    orig_layer = torch.nn.Linear(64, 16)
    orig_layer_state_dict = orig_layer.state_dict()

    # Prepare a quantized InvokeLinearNF4 layer.
    quantized_layer = InvokeLinearNF4(input_features=64, output_features=16)
    quantized_layer.load_state_dict(orig_layer_state_dict)
    quantized_layer.to("cuda")

    # Assert that the InvokeLinearNF4 layer is quantized.
    assert quantized_layer.weight.bnb_quantized

    return quantized_layer


@pytest.fixture
def linear_nf4_layer():
    return build_linear_nf4_layer()


def test_custom_invoke_linear_nf4_all_weights_on_cuda(linear_nf4_layer: InvokeLinearNF4):
    """Test CustomInvokeLinearNF4 inference with all weights on the GPU."""
    # Run inference on the original layer.
    x = torch.randn(1, 64).to("cuda")
    y_quantized = linear_nf4_layer(x)

    # Wrap the InvokeLinearNF4 layer in a CustomInvokeLinearNF4 layer, and run inference on it.
    linear_nf4_layer.__class__ = CustomInvokeLinearNF4
    y_custom = linear_nf4_layer(x)

    # Assert that the quantized and custom layers produce the same output.
    assert torch.allclose(y_quantized, y_custom, atol=1e-5)


# We run with two different input dimensions, because the NF4 layer follows a different code path depending on the
# input dimension, and this has caused issues in the past.
@pytest.mark.parametrize("input_dim_0", [1, 2])
def test_custom_invoke_linear_nf4_all_weights_on_cpu(linear_nf4_layer: InvokeLinearNF4, input_dim_0: int):
    """Test CustomInvokeLinearNF4 inference with all weights on the CPU (streaming to the GPU)."""
    # Run inference on the original layer.
    x = torch.randn(input_dim_0, 64).to(device="cuda")
    y_quantized = linear_nf4_layer(x)

    # Copy the state dict to the CPU and reload it.
    state_dict = linear_nf4_layer.state_dict()
    state_dict = {k: v.to("cpu") for k, v in state_dict.items()}
    linear_nf4_layer.load_state_dict(state_dict)

    # Inference of the original layer should fail.
    with pytest.raises(RuntimeError):
        linear_nf4_layer(x)

    # Wrap the InvokeLinearNF4 layer in a CustomInvokeLinearNF4 layer, and run inference on it.
    linear_nf4_layer.__class__ = CustomInvokeLinearNF4
    y_custom = linear_nf4_layer(x)

    # Assert that the state dict (and the tensors that it references) are still on the CPU.
    assert all(v.device == torch.device("cpu") for v in state_dict.values())

    # Assert that the weight, bias, and quant_state are all on the CPU.
    assert linear_nf4_layer.weight.device == torch.device("cpu")
    assert linear_nf4_layer.bias.device == torch.device("cpu")
    assert linear_nf4_layer.weight.quant_state.absmax.device == torch.device("cpu")
    assert linear_nf4_layer.weight.quant_state.code.device == torch.device("cpu")

    # Assert that the quantized and custom layers produce the same output.
    assert torch.allclose(y_quantized, y_custom, atol=1e-5)
