import type { CanvasManager } from 'features/controlLayers/konva/CanvasManager';
import { getScaledCursorPosition } from 'features/controlLayers/konva/util';
import type {
  CanvasV2State,
  InpaintMaskEntity,
  LayerEntity,
  Position,
  RegionEntity,
  Tool,
} from 'features/controlLayers/store/types';
import { isDrawableEntity, isDrawableEntityAdapter } from 'features/controlLayers/store/types';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { clamp } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';

import { BRUSH_SPACING_TARGET_SCALE, CANVAS_SCALE_BY, MAX_CANVAS_SCALE, MIN_CANVAS_SCALE } from './constants';
import { getBrushLineId, getEraserLineId, getRectShapeId } from './naming';

/**
 * Updates the last cursor position atom with the current cursor position, returning the new position or `null` if the
 * cursor is not over the stage.
 * @param stage The konva stage
 * @param setLastCursorPos The callback to store the cursor pos
 */
const updateLastCursorPos = (stage: Konva.Stage, setLastCursorPos: CanvasManager['stateApi']['setLastCursorPos']) => {
  const pos = getScaledCursorPosition(stage);
  if (!pos) {
    return null;
  }
  setLastCursorPos(pos);
  return pos;
};

const calculateNewBrushSize = (brushSize: number, delta: number) => {
  // This equation was derived by fitting a curve to the desired brush sizes and deltas
  // see https://github.com/invoke-ai/InvokeAI/pull/5542#issuecomment-1915847565
  const targetDelta = Math.sign(delta) * 0.7363 * Math.pow(1.0394, brushSize);
  // This needs to be clamped to prevent the delta from getting too large
  const finalDelta = clamp(targetDelta, -20, 20);
  // The new brush size is also clamped to prevent it from getting too large or small
  const newBrushSize = clamp(brushSize + finalDelta, 1, 500);

  return newBrushSize;
};

const getNextPoint = (
  currentPos: Position,
  toolState: CanvasV2State['tool'],
  lastAddedPoint: Position | null
): Position | null => {
  // Continue the last line
  const minSpacingPx =
    toolState.selected === 'brush'
      ? toolState.brush.width * BRUSH_SPACING_TARGET_SCALE
      : toolState.eraser.width * BRUSH_SPACING_TARGET_SCALE;

  if (lastAddedPoint) {
    // Dispatching redux events impacts perf substantially - using brush spacing keeps dispatches to a reasonable number
    if (Math.hypot(lastAddedPoint.x - currentPos.x, lastAddedPoint.y - currentPos.y) < minSpacingPx) {
      return null;
    }
  }

  return currentPos;
};

const getLastPointOfLine = (points: number[]): Position | null => {
  if (points.length < 2) {
    return null;
  }
  const x = points[points.length - 2];
  const y = points[points.length - 1];
  if (x === undefined || y === undefined) {
    return null;
  }
  return { x, y };
};

const getLastPointOfLastLineOfEntity = (
  entity: LayerEntity | RegionEntity | InpaintMaskEntity,
  tool: Tool
): Position | null => {
  const lastObject = entity.objects[entity.objects.length - 1];

  if (!lastObject) {
    return null;
  }

  if (
    !(
      (lastObject.type === 'brush_line' && tool === 'brush') ||
      (lastObject.type === 'eraser_line' && tool === 'eraser')
    )
  ) {
    // If the last object type and current tool do not match, we cannot continue the line
    return null;
  }

  if (lastObject.points.length < 2) {
    return null;
  }
  const x = lastObject.points[lastObject.points.length - 2];
  const y = lastObject.points[lastObject.points.length - 1];
  if (x === undefined || y === undefined) {
    return null;
  }
  return { x, y };
};

export const setStageEventHandlers = (manager: CanvasManager): (() => void) => {
  const { stage, stateApi, getSelectedEntityAdapter } = manager;
  const {
    getToolState,
    getCurrentFill,
    setTool,
    setToolBuffer,
    setIsMouseDown,
    setLastMouseDownPos,
    getLastCursorPos,
    setLastCursorPos,
    // getLastAddedPoint,
    setLastAddedPoint,
    setStageAttrs,
    getSelectedEntity,
    getSpaceKey,
    setSpaceKey,
    getBbox,
    getSettings,
    onBrushWidthChanged,
    onEraserWidthChanged,
  } = stateApi;

  function getIsPrimaryMouseDown(e: KonvaEventObject<MouseEvent>) {
    return e.evt.buttons === 1;
  }

  function getClip(entity: RegionEntity | LayerEntity | InpaintMaskEntity) {
    const settings = getSettings();
    const bbox = getBbox();

    if (settings.clipToBbox) {
      return {
        x: bbox.x - entity.x,
        y: bbox.y - entity.y,
        width: bbox.width,
        height: bbox.height,
      };
    } else {
      return {
        x: -stage.x() / stage.scaleX() - entity.x,
        y: -stage.y() / stage.scaleY() - entity.y,
        width: stage.width() / stage.scaleX(),
        height: stage.height() / stage.scaleY(),
      };
    }
  }

  //#region mouseenter
  stage.on('mouseenter', () => {
    manager.preview.tool.render();
  });

  //#region mousedown
  stage.on('mousedown', async (e) => {
    setIsMouseDown(true);
    const toolState = getToolState();
    const pos = updateLastCursorPos(stage, setLastCursorPos);
    const selectedEntity = getSelectedEntity();
    const selectedEntityAdapter = getSelectedEntityAdapter();

    if (
      pos &&
      selectedEntity &&
      isDrawableEntity(selectedEntity) &&
      selectedEntityAdapter &&
      isDrawableEntityAdapter(selectedEntityAdapter) &&
      !getSpaceKey() &&
      getIsPrimaryMouseDown(e)
    ) {
      setLastMouseDownPos(pos);

      if (toolState.selected === 'brush') {
        const lastLinePoint = getLastPointOfLastLineOfEntity(selectedEntity, toolState.selected);
        if (e.evt.shiftKey && lastLinePoint) {
          // Create a straight line from the last line point
          if (selectedEntityAdapter.getDrawingBuffer()) {
            selectedEntityAdapter.finalizeDrawingBuffer();
          }
          await selectedEntityAdapter.setDrawingBuffer({
            id: getBrushLineId(selectedEntityAdapter.id, uuidv4()),
            type: 'brush_line',
            points: [
              // The last point of the last line is already normalized to the entity's coordinates
              lastLinePoint.x,
              lastLinePoint.y,
              pos.x - selectedEntity.x,
              pos.y - selectedEntity.y,
            ],
            strokeWidth: toolState.brush.width,
            color: getCurrentFill(),
            clip: getClip(selectedEntity),
          });
        } else {
          if (selectedEntityAdapter.getDrawingBuffer()) {
            selectedEntityAdapter.finalizeDrawingBuffer();
          }
          await selectedEntityAdapter.setDrawingBuffer({
            id: getBrushLineId(selectedEntityAdapter.id, uuidv4()),
            type: 'brush_line',
            points: [pos.x - selectedEntity.x, pos.y - selectedEntity.y],
            strokeWidth: toolState.brush.width,
            color: getCurrentFill(),
            clip: getClip(selectedEntity),
          });
        }
        setLastAddedPoint(pos);
      }

      if (toolState.selected === 'eraser') {
        const lastLinePoint = getLastPointOfLastLineOfEntity(selectedEntity, toolState.selected);
        if (e.evt.shiftKey && lastLinePoint) {
          // Create a straight line from the last line point
          if (selectedEntityAdapter.getDrawingBuffer()) {
            selectedEntityAdapter.finalizeDrawingBuffer();
          }
          await selectedEntityAdapter.setDrawingBuffer({
            id: getBrushLineId(selectedEntityAdapter.id, uuidv4()),
            type: 'eraser_line',
            points: [
              // The last point of the last line is already normalized to the entity's coordinates
              lastLinePoint.x,
              lastLinePoint.y,
              pos.x - selectedEntity.x,
              pos.y - selectedEntity.y,
            ],
            strokeWidth: toolState.eraser.width,
            clip: getClip(selectedEntity),
          });
        } else {
          if (selectedEntityAdapter.getDrawingBuffer()) {
            selectedEntityAdapter.finalizeDrawingBuffer();
          }
          await selectedEntityAdapter.setDrawingBuffer({
            id: getEraserLineId(selectedEntityAdapter.id, uuidv4()),
            type: 'eraser_line',
            points: [pos.x - selectedEntity.x, pos.y - selectedEntity.y],
            strokeWidth: toolState.eraser.width,
            clip: getClip(selectedEntity),
          });
        }
        setLastAddedPoint(pos);
      }

      if (toolState.selected === 'rect') {
        if (selectedEntityAdapter.getDrawingBuffer()) {
          selectedEntityAdapter.finalizeDrawingBuffer();
        }
        await selectedEntityAdapter.setDrawingBuffer({
          id: getRectShapeId(selectedEntityAdapter.id, uuidv4()),
          type: 'rect_shape',
          x: pos.x - selectedEntity.x,
          y: pos.y - selectedEntity.y,
          width: 0,
          height: 0,
          color: getCurrentFill(),
        });
      }
    }
    manager.preview.tool.render();
  });

  //#region mouseup
  stage.on('mouseup', async () => {
    setIsMouseDown(false);
    const pos = getLastCursorPos();
    const selectedEntity = getSelectedEntity();
    const selectedEntityAdapter = getSelectedEntityAdapter();

    if (
      pos &&
      selectedEntity &&
      isDrawableEntity(selectedEntity) &&
      selectedEntityAdapter &&
      isDrawableEntityAdapter(selectedEntityAdapter) &&
      !getSpaceKey()
    ) {
      const toolState = getToolState();

      if (toolState.selected === 'brush') {
        const drawingBuffer = selectedEntityAdapter.getDrawingBuffer();
        if (drawingBuffer?.type === 'brush_line') {
          selectedEntityAdapter.finalizeDrawingBuffer();
        } else {
          await selectedEntityAdapter.setDrawingBuffer(null);
        }
      }

      if (toolState.selected === 'eraser') {
        const drawingBuffer = selectedEntityAdapter.getDrawingBuffer();
        if (drawingBuffer?.type === 'eraser_line') {
          selectedEntityAdapter.finalizeDrawingBuffer();
        } else {
          await selectedEntityAdapter.setDrawingBuffer(null);
        }
      }

      if (toolState.selected === 'rect') {
        const drawingBuffer = selectedEntityAdapter.getDrawingBuffer();
        if (drawingBuffer?.type === 'rect_shape') {
          selectedEntityAdapter.finalizeDrawingBuffer();
        } else {
          await selectedEntityAdapter.setDrawingBuffer(null);
        }
      }

      setLastMouseDownPos(null);
    }

    manager.preview.tool.render();
  });

  //#region mousemove
  stage.on('mousemove', async (e) => {
    const toolState = getToolState();
    const pos = updateLastCursorPos(stage, setLastCursorPos);
    const selectedEntity = getSelectedEntity();
    const selectedEntityAdapter = getSelectedEntityAdapter();

    if (
      pos &&
      selectedEntity &&
      isDrawableEntity(selectedEntity) &&
      selectedEntityAdapter &&
      isDrawableEntityAdapter(selectedEntityAdapter) &&
      !getSpaceKey() &&
      getIsPrimaryMouseDown(e)
    ) {
      if (toolState.selected === 'brush') {
        const drawingBuffer = selectedEntityAdapter.getDrawingBuffer();
        if (drawingBuffer) {
          if (drawingBuffer?.type === 'brush_line') {
            const nextPoint = getNextPoint(pos, toolState, getLastPointOfLine(drawingBuffer.points));
            if (nextPoint) {
              drawingBuffer.points.push(nextPoint.x - selectedEntity.x, nextPoint.y - selectedEntity.y);
              await selectedEntityAdapter.setDrawingBuffer(drawingBuffer);
              setLastAddedPoint(nextPoint);
            }
          } else {
            await selectedEntityAdapter.setDrawingBuffer(null);
          }
        } else {
          if (selectedEntityAdapter.getDrawingBuffer()) {
            selectedEntityAdapter.finalizeDrawingBuffer();
          }
          await selectedEntityAdapter.setDrawingBuffer({
            id: getBrushLineId(selectedEntityAdapter.id, uuidv4()),
            type: 'brush_line',
            points: [pos.x - selectedEntity.x, pos.y - selectedEntity.y],
            strokeWidth: toolState.brush.width,
            color: getCurrentFill(),
            clip: getClip(selectedEntity),
          });
          setLastAddedPoint(pos);
        }
      }

      if (toolState.selected === 'eraser') {
        const drawingBuffer = selectedEntityAdapter.getDrawingBuffer();
        if (drawingBuffer) {
          if (drawingBuffer.type === 'eraser_line') {
            const nextPoint = getNextPoint(pos, toolState, getLastPointOfLine(drawingBuffer.points));
            if (nextPoint) {
              drawingBuffer.points.push(nextPoint.x - selectedEntity.x, nextPoint.y - selectedEntity.y);
              await selectedEntityAdapter.setDrawingBuffer(drawingBuffer);
              setLastAddedPoint(nextPoint);
            }
          } else {
            await selectedEntityAdapter.setDrawingBuffer(null);
          }
        } else {
          if (selectedEntityAdapter.getDrawingBuffer()) {
            selectedEntityAdapter.finalizeDrawingBuffer();
          }
          await selectedEntityAdapter.setDrawingBuffer({
            id: getEraserLineId(selectedEntityAdapter.id, uuidv4()),
            type: 'eraser_line',
            points: [pos.x - selectedEntity.x, pos.y - selectedEntity.y],
            strokeWidth: toolState.eraser.width,
            clip: getClip(selectedEntity),
          });
          setLastAddedPoint(pos);
        }
      }

      if (toolState.selected === 'rect') {
        const drawingBuffer = selectedEntityAdapter.getDrawingBuffer();
        if (drawingBuffer) {
          if (drawingBuffer.type === 'rect_shape') {
            drawingBuffer.width = pos.x - selectedEntity.x - drawingBuffer.x;
            drawingBuffer.height = pos.y - selectedEntity.y - drawingBuffer.y;
            await selectedEntityAdapter.setDrawingBuffer(drawingBuffer);
          } else {
            await selectedEntityAdapter.setDrawingBuffer(null);
          }
        }
      }
    }
    manager.preview.tool.render();
  });

  //#region mouseleave
  stage.on('mouseleave', async (e) => {
    const pos = updateLastCursorPos(stage, setLastCursorPos);
    setLastCursorPos(null);
    setLastMouseDownPos(null);
    const selectedEntity = getSelectedEntity();
    const selectedEntityAdapter = getSelectedEntityAdapter();
    const toolState = getToolState();

    if (
      pos &&
      selectedEntity &&
      isDrawableEntity(selectedEntity) &&
      selectedEntityAdapter &&
      isDrawableEntityAdapter(selectedEntityAdapter) &&
      !getSpaceKey() &&
      getIsPrimaryMouseDown(e)
    ) {
      const drawingBuffer = selectedEntityAdapter.getDrawingBuffer();
      if (toolState.selected === 'brush' && drawingBuffer?.type === 'brush_line') {
        drawingBuffer.points.push(pos.x - selectedEntity.x, pos.y - selectedEntity.y);
        await selectedEntityAdapter.setDrawingBuffer(drawingBuffer);
        selectedEntityAdapter.finalizeDrawingBuffer();
      } else if (toolState.selected === 'eraser' && drawingBuffer?.type === 'eraser_line') {
        drawingBuffer.points.push(pos.x - selectedEntity.x, pos.y - selectedEntity.y);
        await selectedEntityAdapter.setDrawingBuffer(drawingBuffer);
        selectedEntityAdapter.finalizeDrawingBuffer();
      } else if (toolState.selected === 'rect' && drawingBuffer?.type === 'rect_shape') {
        drawingBuffer.width = pos.x - selectedEntity.x - drawingBuffer.x;
        drawingBuffer.height = pos.y - selectedEntity.y - drawingBuffer.y;
        await selectedEntityAdapter.setDrawingBuffer(drawingBuffer);
        selectedEntityAdapter.finalizeDrawingBuffer();
      }
    }

    manager.preview.tool.render();
  });

  //#region wheel
  stage.on('wheel', (e) => {
    e.evt.preventDefault();

    if (e.evt.ctrlKey || e.evt.metaKey) {
      const toolState = getToolState();
      let delta = e.evt.deltaY;
      if (toolState.invertScroll) {
        delta = -delta;
      }
      // Holding ctrl or meta while scrolling changes the brush size
      if (toolState.selected === 'brush') {
        onBrushWidthChanged(calculateNewBrushSize(toolState.brush.width, delta));
      } else if (toolState.selected === 'eraser') {
        onEraserWidthChanged(calculateNewBrushSize(toolState.eraser.width, delta));
      }
    } else {
      // We need the absolute cursor position - not the scaled position
      const cursorPos = stage.getPointerPosition();
      if (cursorPos) {
        // Stage's x and y scale are always the same
        const stageScale = stage.scaleX();
        // When wheeling on trackpad, e.evt.ctrlKey is true - in that case, let's reverse the direction
        const delta = e.evt.ctrlKey ? -e.evt.deltaY : e.evt.deltaY;
        const mousePointTo = {
          x: (cursorPos.x - stage.x()) / stageScale,
          y: (cursorPos.y - stage.y()) / stageScale,
        };
        const newScale = clamp(stageScale * CANVAS_SCALE_BY ** delta, MIN_CANVAS_SCALE, MAX_CANVAS_SCALE);
        const newPos = {
          x: cursorPos.x - mousePointTo.x * newScale,
          y: cursorPos.y - mousePointTo.y * newScale,
        };

        stage.scaleX(newScale);
        stage.scaleY(newScale);
        stage.position(newPos);
        setStageAttrs({ ...newPos, width: stage.width(), height: stage.height(), scale: newScale });
        manager.background.render();
        manager.preview.documentSizeOverlay.render();
      }
    }
    manager.preview.tool.render();
  });

  //#region dragmove
  stage.on('dragmove', () => {
    setStageAttrs({
      x: Math.floor(stage.x()),
      y: Math.floor(stage.y()),
      width: stage.width(),
      height: stage.height(),
      scale: stage.scaleX(),
    });
    manager.background.render();
    manager.preview.documentSizeOverlay.render();
    manager.preview.tool.render();
  });

  //#region dragend
  stage.on('dragend', () => {
    // Stage position should always be an integer, else we get fractional pixels which are blurry
    setStageAttrs({
      x: Math.floor(stage.x()),
      y: Math.floor(stage.y()),
      width: stage.width(),
      height: stage.height(),
      scale: stage.scaleX(),
    });
    manager.preview.tool.render();
  });

  //#region key
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) {
      return;
    }
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    if (e.key === 'Escape') {
      // Cancel shape drawing on escape
      setLastMouseDownPos(null);
    } else if (e.key === ' ') {
      // Select the view tool on space key down
      setToolBuffer(getToolState().selected);
      setTool('view');
      setSpaceKey(true);
      setLastCursorPos(null);
      setLastMouseDownPos(null);
    } else if (e.key === 'r') {
      setLastCursorPos(null);
      setLastMouseDownPos(null);
      manager.preview.documentSizeOverlay.fitToStage();
      manager.background.render();
      manager.preview.documentSizeOverlay.render();
    }
    manager.preview.tool.render();
  };
  window.addEventListener('keydown', onKeyDown);

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.repeat) {
      return;
    }
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    if (e.key === ' ') {
      // Revert the tool to the previous tool on space key up
      const toolBuffer = getToolState().selectedBuffer;
      setTool(toolBuffer ?? 'move');
      setToolBuffer(null);
      setSpaceKey(false);
    }
    manager.preview.tool.render();
  };
  window.addEventListener('keyup', onKeyUp);

  return () => {
    stage.off('mousedown mouseup mousemove mouseenter mouseleave wheel dragend');
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  };
};