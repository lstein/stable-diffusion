import { ButtonGroup, IconButton } from '@invoke-ai/ui-library';
import { createMemoizedSelector } from 'app/store/createMemoizedSelector';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import {
  caDeleted,
  ipaDeleted,
  layerDeleted,
  layerReset,
  rgDeleted,
  rgReset,
  selectCanvasV2Slice,
  toolChanged,
} from 'features/controlLayers/store/canvasV2Slice';
import type { CanvasEntityIdentifier } from 'features/controlLayers/store/types';
import { useCallback, useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import {
  PiArrowsOutCardinalBold,
  PiBoundingBoxBold,
  PiEraserBold,
  PiHandBold,
  PiPaintBrushBold,
  PiRectangleBold,
} from 'react-icons/pi';

const DRAWING_TOOL_TYPES = ['layer', 'regional_guidance', 'inpaint_mask'];

const getIsDrawingToolEnabled = (entityIdentifier: CanvasEntityIdentifier | null) => {
  if (!entityIdentifier) {
    return false;
  }
  return DRAWING_TOOL_TYPES.includes(entityIdentifier.type);
};

const selectSelectedEntityIdentifier = createMemoizedSelector(
  selectCanvasV2Slice,
  (canvasV2State) => canvasV2State.selectedEntityIdentifier
);

export const ToolChooser: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selectedEntityIdentifier = useAppSelector(selectSelectedEntityIdentifier);
  const isDrawingToolDisabled = useMemo(
    () => !getIsDrawingToolEnabled(selectedEntityIdentifier),
    [selectedEntityIdentifier]
  );
  const isMoveToolDisabled = useMemo(() => selectedEntityIdentifier === null, [selectedEntityIdentifier]);
  const tool = useAppSelector((s) => s.canvasV2.tool.selected);

  const setToolToBrush = useCallback(() => {
    dispatch(toolChanged('brush'));
  }, [dispatch]);
  useHotkeys('b', setToolToBrush, { enabled: !isDrawingToolDisabled }, [isDrawingToolDisabled, setToolToBrush]);
  const setToolToEraser = useCallback(() => {
    dispatch(toolChanged('eraser'));
  }, [dispatch]);
  useHotkeys('e', setToolToEraser, { enabled: !isDrawingToolDisabled }, [isDrawingToolDisabled, setToolToEraser]);
  const setToolToRect = useCallback(() => {
    dispatch(toolChanged('rect'));
  }, [dispatch]);
  useHotkeys('u', setToolToRect, { enabled: !isDrawingToolDisabled }, [isDrawingToolDisabled, setToolToRect]);
  const setToolToMove = useCallback(() => {
    dispatch(toolChanged('move'));
  }, [dispatch]);
  useHotkeys('v', setToolToMove, { enabled: !isMoveToolDisabled }, [isMoveToolDisabled, setToolToMove]);
  const setToolToView = useCallback(() => {
    dispatch(toolChanged('view'));
  }, [dispatch]);
  useHotkeys('h', setToolToView, [setToolToView]);
  const setToolToBbox = useCallback(() => {
    dispatch(toolChanged('bbox'));
  }, [dispatch]);
  useHotkeys('q', setToolToBbox, [setToolToBbox]);

  const resetSelectedLayer = useCallback(() => {
    if (selectedEntityIdentifier === null) {
      return;
    }
    const { type, id } = selectedEntityIdentifier;
    if (type === 'layer') {
      dispatch(layerReset({ id }));
    }
    if (type === 'regional_guidance') {
      dispatch(rgReset({ id }));
    }
  }, [dispatch, selectedEntityIdentifier]);
  const isResetEnabled = useMemo(
    () => selectedEntityIdentifier?.type === 'layer' || selectedEntityIdentifier?.type === 'regional_guidance',
    [selectedEntityIdentifier]
  );
  useHotkeys('shift+c', resetSelectedLayer, { enabled: isResetEnabled }, [isResetEnabled, resetSelectedLayer]);

  const deleteSelectedLayer = useCallback(() => {
    if (selectedEntityIdentifier === null) {
      return;
    }
    const { type, id } = selectedEntityIdentifier;
    if (type === 'layer') {
      dispatch(layerDeleted({ id }));
    }
    if (type === 'regional_guidance') {
      dispatch(rgDeleted({ id }));
    }
    if (type === 'control_adapter') {
      dispatch(caDeleted({ id }));
    }
    if (type === 'ip_adapter') {
      dispatch(ipaDeleted({ id }));
    }
  }, [dispatch, selectedEntityIdentifier]);
  const isDeleteEnabled = useMemo(() => selectedEntityIdentifier !== null, [selectedEntityIdentifier]);
  useHotkeys('shift+d', deleteSelectedLayer, { enabled: isDeleteEnabled }, [isDeleteEnabled, deleteSelectedLayer]);

  return (
    <ButtonGroup isAttached>
      <IconButton
        aria-label={`${t('unifiedCanvas.brush')} (B)`}
        tooltip={`${t('unifiedCanvas.brush')} (B)`}
        icon={<PiPaintBrushBold />}
        variant={tool === 'brush' ? 'solid' : 'outline'}
        onClick={setToolToBrush}
        isDisabled={isDrawingToolDisabled}
      />
      <IconButton
        aria-label={`${t('unifiedCanvas.eraser')} (E)`}
        tooltip={`${t('unifiedCanvas.eraser')} (E)`}
        icon={<PiEraserBold />}
        variant={tool === 'eraser' ? 'solid' : 'outline'}
        onClick={setToolToEraser}
        isDisabled={isDrawingToolDisabled}
      />
      <IconButton
        aria-label={`${t('controlLayers.rectangle')} (U)`}
        tooltip={`${t('controlLayers.rectangle')} (U)`}
        icon={<PiRectangleBold />}
        variant={tool === 'rect' ? 'solid' : 'outline'}
        onClick={setToolToRect}
        isDisabled={isDrawingToolDisabled}
      />
      <IconButton
        aria-label={`${t('unifiedCanvas.move')} (V)`}
        tooltip={`${t('unifiedCanvas.move')} (V)`}
        icon={<PiArrowsOutCardinalBold />}
        variant={tool === 'move' ? 'solid' : 'outline'}
        onClick={setToolToMove}
        isDisabled={isMoveToolDisabled}
      />
      <IconButton
        aria-label={`${t('unifiedCanvas.view')} (H)`}
        tooltip={`${t('unifiedCanvas.view')} (H)`}
        icon={<PiHandBold />}
        variant={tool === 'view' ? 'solid' : 'outline'}
        onClick={setToolToView}
      />
      <IconButton
        aria-label={`${t('controlLayers.bbox')} (Q)`}
        tooltip={`${t('controlLayers.bbox')} (Q)`}
        icon={<PiBoundingBoxBold />}
        variant={tool === 'bbox' ? 'solid' : 'outline'}
        onClick={setToolToBbox}
      />
    </ButtonGroup>
  );
};