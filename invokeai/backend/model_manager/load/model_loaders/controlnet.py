# Copyright (c) 2024, Lincoln D. Stein and the InvokeAI Development Team
"""Class for ControlNet model loading in InvokeAI."""

from pathlib import Path
from typing import Optional
from diffusers import ControlNetModel
from invokeai.backend.model_manager import (
    AnyModel,
    AnyModelConfig,
    BaseModelType,
    ModelFormat,
    ModelType,
)
from invokeai.backend.model_manager.config import SubModelType, ControlNetCheckpointConfig

from .. import ModelLoaderRegistry
from .generic_diffusers import GenericDiffusersLoader


@ModelLoaderRegistry.register(base=BaseModelType.Any, type=ModelType.ControlNet, format=ModelFormat.Diffusers)
@ModelLoaderRegistry.register(base=BaseModelType.Any, type=ModelType.ControlNet, format=ModelFormat.Checkpoint)
class ControlNetLoader(GenericDiffusersLoader):
    """Class to load ControlNet models."""

    def _load_model(
        self,
        config: AnyModelConfig,
        submodel_type: Optional[SubModelType] = None,
    ) -> AnyModel:
        if isinstance(config, ControlNetCheckpointConfig):
            return ControlNetModel.from_single_file(config.path,
                                                    config=self._app_config.legacy_conf_path / config.config_path,
                                                    torch_dtype=self._torch_dtype,
                                                    local_files_only=True,
                                                    )
        else:
            return super()._load_model(config, submodel_type)

    # def _convert_model(self, config: AnyModelConfig, model_path: Path, output_path: Optional[Path] = None) -> AnyModel:
    #     assert isinstance(config, CheckpointConfigBase)
    #     image_size = (
    #         512
    #         if config.base == BaseModelType.StableDiffusion1
    #         else 768
    #         if config.base == BaseModelType.StableDiffusion2
    #         else 1024
    #     )

    #     self._logger.info(f"Converting {model_path} to diffusers format")
    #     with open(self._app_config.legacy_conf_path / config.config_path, "r") as config_stream:
    #         result = convert_controlnet_to_diffusers(
    #             model_path,
    #             output_path,
    #             original_config_file=config_stream,
    #             image_size=image_size,
    #             precision=self._torch_dtype,
    #             from_safetensors=model_path.suffix == ".safetensors",
    #         )
    #     return result
