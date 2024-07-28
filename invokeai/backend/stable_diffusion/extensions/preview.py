from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Any, Callable, Optional

import torch

from invokeai.backend.stable_diffusion.extension_callback_type import ExtensionCallbackType
from invokeai.backend.stable_diffusion.extension_override_type import ExtensionOverrideType
from invokeai.backend.stable_diffusion.extensions.base import ExtensionBase, callback, override

if TYPE_CHECKING:
    from invokeai.backend.stable_diffusion.denoise_context import DenoiseContext
    from invokeai.backend.stable_diffusion.extensions_manager import ExtensionsManager


# TODO: change event to accept image instead of latents
@dataclass
class PipelineIntermediateState:
    step: int
    order: int
    total_steps: int
    timestep: int
    latents: torch.Tensor
    predicted_original: Optional[torch.Tensor] = None


class PreviewExt(ExtensionBase):
    def __init__(self, callback: Callable[[PipelineIntermediateState], None]):
        super().__init__()
        self.callback = callback

    # do last so that all other changes shown
    @callback(ExtensionCallbackType.PRE_DENOISE_LOOP, order=1000)
    def initial_preview(self, ctx: DenoiseContext):
        self.callback(
            PipelineIntermediateState(
                step=-1,
                order=ctx.scheduler.order,
                total_steps=len(ctx.inputs.timesteps),
                timestep=int(ctx.scheduler.config.num_train_timesteps),  # TODO: is there any code which uses it?
                latents=ctx.latents,
            )
        )

    # TODO: remove when inpaint PR merged
    @override(ExtensionOverrideType.STEP)
    def step(self, orig_func: Callable[..., Any], ctx: DenoiseContext, ext_manager: ExtensionsManager):
        step_output = orig_func(ctx, ext_manager)
        if hasattr(step_output, "denoised"):
            predicted_original = step_output.denoised
        elif hasattr(step_output, "pred_original_sample"):
            predicted_original = step_output.pred_original_sample
        else:
            predicted_original = step_output.prev_sample

        self.callback(
            PipelineIntermediateState(
                step=ctx.step_index,
                order=ctx.scheduler.order,
                total_steps=len(ctx.inputs.timesteps),
                timestep=int(ctx.timestep),  # TODO: is there any code which uses it?
                latents=step_output.prev_sample,
                predicted_original=predicted_original,  # TODO: is there any reason for additional field?
            )
        )

        return step_output

    """
    # do last so that all other changes shown
    @callback(ExtensionCallbackType.POST_STEP, order=1000)
    def step_preview(self, ctx: DenoiseContext):
        if hasattr(ctx.step_output, "denoised"):
            predicted_original = ctx.step_output.denoised
        elif hasattr(ctx.step_output, "pred_original_sample"):
            predicted_original = ctx.step_output.pred_original_sample
        else:
            predicted_original = ctx.step_output.prev_sample

        self.callback(
            PipelineIntermediateState(
                step=ctx.step_index,
                order=ctx.scheduler.order,
                total_steps=len(ctx.inputs.timesteps),
                timestep=int(ctx.timestep),  # TODO: is there any code which uses it?
                latents=ctx.step_output.prev_sample,
                predicted_original=predicted_original,  # TODO: is there any reason for additional field?
            )
        )
    """
