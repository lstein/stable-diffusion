from contextlib import contextmanager
from typing import Dict, Iterable, Optional, Tuple

import torch

from invokeai.backend.lora.lora_model_raw import LoRAModelRaw
from invokeai.backend.util.devices import TorchDevice
from invokeai.backend.util.original_weights_storage import OriginalWeightsStorage


class LoraPatcher:
    @staticmethod
    @torch.no_grad()
    @contextmanager
    def apply_lora_patches(
        model: torch.nn.Module,
        patches: Iterable[Tuple[LoRAModelRaw, float]],
        prefix: str,
        cached_weights: Optional[Dict[str, torch.Tensor]] = None,
    ):
        """Apply one or more LoRA patches to a model within a context manager.

        :param model: The model to patch.
        :param loras: An iterator that returns tuples of LoRA patches and associated weights. An iterator is used so
            that the LoRA patches do not need to be loaded into memory all at once.
        :param prefix: The keys in the patches will be filtered to only include weights with this prefix.
        :cached_weights: Read-only copy of the model's state dict in CPU, for efficient unpatching purposes.
        """
        original_weights = OriginalWeightsStorage(cached_weights)
        try:
            for patch, patch_weight in patches:
                LoraPatcher.apply_lora_patch(
                    model=model,
                    prefix=prefix,
                    patch=patch,
                    patch_weight=patch_weight,
                    original_weights=original_weights,
                )
                del patch

            yield
        finally:
            for param_key, weight in original_weights.get_changed_weights():
                model.get_parameter(param_key).copy_(weight)

    @staticmethod
    @torch.no_grad()
    def apply_lora_patch(
        model: torch.nn.Module,
        prefix: str,
        patch: LoRAModelRaw,
        patch_weight: float,
        original_weights: OriginalWeightsStorage,
    ):
        """
        Apply a single LoRA patch to a model.
        :param model: The model to patch.
        :param patch: LoRA model to patch in.
        :param patch_weight: LoRA patch weight.
        :param prefix: A string prefix that precedes keys used in the LoRAs weight layers.
        :param original_weights: Storage with original weights, filled by weights which lora patches, used for unpatching.
        """

        if patch_weight == 0:
            return

        # If the layer keys contain a dot, then they are not flattened, and can be directly used to access model
        # submodules. If the layer keys do not contain a dot, then they are flattened, meaning that all '.' have been
        # replaced with '_'. Non-flattened keys are preferred, because they allow submodules to be accessed directly
        # without searching, but some legacy code still uses flattened keys.
        layer_keys_are_flattened = "." not in next(iter(patch.layers.keys()))

        prefix_len = len(prefix)

        for layer_key, layer in patch.layers.items():
            if not layer_key.startswith(prefix):
                continue

            module_key, module = LoraPatcher._get_submodule(
                model, layer_key[prefix_len:], layer_key_is_flattened=layer_keys_are_flattened
            )

            # All of the LoRA weight calculations will be done on the same device as the module weight.
            # (Performance will be best if this is a CUDA device.)
            device = module.weight.device
            dtype = module.weight.dtype

            layer_scale = layer.alpha / layer.rank if (layer.alpha and layer.rank) else 1.0

            # We intentionally move to the target device first, then cast. Experimentally, this was found to
            # be significantly faster for 16-bit CPU tensors being moved to a CUDA device than doing the
            # same thing in a single call to '.to(...)'.
            layer.to(device=device)
            layer.to(dtype=torch.float32)

            # TODO(ryand): Using torch.autocast(...) over explicit casting may offer a speed benefit on CUDA
            # devices here. Experimentally, it was found to be very slow on CPU. More investigation needed.
            for param_name, lora_param_weight in layer.get_parameters(module).items():
                param_key = module_key + "." + param_name
                module_param = module.get_parameter(param_name)

                # Save original weight
                original_weights.save(param_key, module_param)

                if module_param.shape != lora_param_weight.shape:
                    lora_param_weight = lora_param_weight.reshape(module_param.shape)

                lora_param_weight *= patch_weight * layer_scale
                module_param += lora_param_weight.to(dtype=dtype)

            layer.to(device=TorchDevice.CPU_DEVICE)

    @staticmethod
    def _get_submodule(
        model: torch.nn.Module, layer_key: str, layer_key_is_flattened: bool
    ) -> tuple[str, torch.nn.Module]:
        """Get the submodule corresponding to the given layer key.
        :param model: The model to search.
        :param layer_key: The layer key to search for.
        :param layer_key_is_flattened: Whether the layer key is flattened. If flattened, then all '.' have been replaced
            with '_'. Non-flattened keys are preferred, because they allow submodules to be accessed directly without
            searching, but some legacy code still uses flattened keys.
        :return: A tuple containing the module key and the submodule.
        """
        if not layer_key_is_flattened:
            return layer_key, model.get_submodule(layer_key)

        # Handle flattened keys.
        assert "." not in layer_key

        module = model
        module_key = ""
        key_parts = layer_key.split("_")

        submodule_name = key_parts.pop(0)

        while len(key_parts) > 0:
            try:
                module = module.get_submodule(submodule_name)
                module_key += "." + submodule_name
                submodule_name = key_parts.pop(0)
            except Exception:
                submodule_name += "_" + key_parts.pop(0)

        module = module.get_submodule(submodule_name)
        module_key = (module_key + "." + submodule_name).lstrip(".")

        return module_key, module
