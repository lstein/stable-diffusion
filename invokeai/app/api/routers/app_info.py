import typing
from enum import Enum
from pathlib import Path

from fastapi import Body
from fastapi.routing import APIRouter
from pydantic import BaseModel, Field

from invokeai.app.invocations.upscale import ESRGAN_MODELS
from invokeai.backend.image_util.invisible_watermark import InvisibleWatermark
from invokeai.backend.image_util.patchmatch import PatchMatch
from invokeai.backend.image_util.safety_checker import SafetyChecker
from invokeai.backend.util.logging import logging
from invokeai.version import __version__

from ..dependencies import ApiDependencies


class LogLevel(int, Enum):
    NotSet = logging.NOTSET
    Debug = logging.DEBUG
    Info = logging.INFO
    Warning = logging.WARNING
    Error = logging.ERROR
    Critical = logging.CRITICAL


class Upscaler(BaseModel):
    upscaling_method: str = Field(description="Name of upscaling method")
    upscaling_models: list[str] = Field(description="List of upscaling models for this method")


app_router = APIRouter(prefix="/v1/app", tags=["app"])


class AppVersion(BaseModel):
    """App Version Response"""

    version: str = Field(description="App version")


class AppConfig(BaseModel):
    """App Config Response"""

    infill_methods: list[str] = Field(description="List of available infill methods")
    upscaling_methods: list[Upscaler] = Field(description="List of upscaling methods")
    nsfw_methods: list[str] = Field(description="List of NSFW checking methods")
    watermarking_methods: list[str] = Field(description="List of invisible watermark methods")


@app_router.get("/version", operation_id="app_version", status_code=200, response_model=AppVersion)
async def get_version() -> AppVersion:
    return AppVersion(version=__version__)


@app_router.get("/config", operation_id="get_config", status_code=200, response_model=AppConfig)
async def get_config() -> AppConfig:
    infill_methods = ["tile", "lama", "cv2"]
    if PatchMatch.patchmatch_available():
        infill_methods.append("patchmatch")

    upscaling_models = []
    for model in typing.get_args(ESRGAN_MODELS):
        upscaling_models.append(str(Path(model).stem))
    upscaler = Upscaler(upscaling_method="esrgan", upscaling_models=upscaling_models)

    nsfw_methods = []
    if SafetyChecker.safety_checker_available():
        nsfw_methods.append("nsfw_checker")

    watermarking_methods = []
    if InvisibleWatermark.invisible_watermark_available():
        watermarking_methods.append("invisible_watermark")

    return AppConfig(
        infill_methods=infill_methods,
        upscaling_methods=[upscaler],
        nsfw_methods=nsfw_methods,
        watermarking_methods=watermarking_methods,
    )


@app_router.get(
    "/logging",
    operation_id="get_log_level",
    responses={200: {"description": "The operation was successful"}},
    response_model=LogLevel,
)
async def get_log_level() -> LogLevel:
    """Returns the log level"""
    return LogLevel(ApiDependencies.invoker.services.logger.level)


@app_router.post(
    "/logging",
    operation_id="set_log_level",
    responses={200: {"description": "The operation was successful"}},
    response_model=LogLevel,
)
async def set_log_level(
    level: LogLevel = Body(description="New log verbosity level"),
) -> LogLevel:
    """Sets the log verbosity level"""
    ApiDependencies.invoker.services.logger.setLevel(level)
    return LogLevel(ApiDependencies.invoker.services.logger.level)


@app_router.delete(
    "/invocation_cache",
    operation_id="clear_invocation_cache",
    responses={200: {"description": "The operation was successful"}},
)
async def clear_invocation_cache() -> None:
    """Clears the invocation cache"""
    ApiDependencies.invoker.services.invocation_cache.clear()
