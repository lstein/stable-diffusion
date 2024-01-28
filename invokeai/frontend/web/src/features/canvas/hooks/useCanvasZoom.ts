import { $ctrl } from '@invoke-ai/ui';
import { useStore } from '@nanostores/react';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { $isMoveStageKeyHeld } from 'features/canvas/store/canvasNanostore';
import {
  setBrushSize,
  setStageCoordinates,
  setStageScale,
} from 'features/canvas/store/canvasSlice';
import {
  CANVAS_SCALE_BY,
  MAX_CANVAS_SCALE,
  MIN_CANVAS_SCALE,
} from 'features/canvas/util/constants';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { clamp } from 'lodash-es';
import type { MutableRefObject } from 'react';
import { useCallback } from 'react';

const useCanvasWheel = (stageRef: MutableRefObject<Konva.Stage | null>) => {
  const dispatch = useAppDispatch();
  const stageScale = useAppSelector((s) => s.canvas.stageScale);
  const isMoveStageKeyHeld = useStore($isMoveStageKeyHeld);
  const brushSize = useAppSelector((s) => s.canvas.brushSize);

  return useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      // stop default scrolling
      if (!stageRef.current || isMoveStageKeyHeld) {
        return;
      }

      e.evt.preventDefault();

      const cursorPos = stageRef.current.getPointerPosition();

      if (!cursorPos) {
        return;
      }

      const mousePointTo = {
        x: (cursorPos.x - stageRef.current.x()) / stageScale,
        y: (cursorPos.y - stageRef.current.y()) / stageScale,
      };

      let delta = e.evt.deltaY;

      let size = brushSize;
      // when we zoom on trackpad, e.evt.ctrlKey is true
      // in that case lets revert direction
      if (e.evt.ctrlKey) {
        delta = -delta;
      }

      if ($ctrl.get()) {
        if (delta > 0) {
          if (brushSize - 5 <= 5) {
            size = Math.max(brushSize - 1, 1);
          } else {
            size = Math.max(brushSize - 5, 1);
          }
        } else {
          size = Math.min(brushSize + 5, 500);
        }
      }else{

      const newScale = clamp(stageScale * CANVAS_SCALE_BY ** delta, MIN_CANVAS_SCALE, MAX_CANVAS_SCALE);

      const newCoordinates = {
        x: cursorPos.x - mousePointTo.x * newScale,
        y: cursorPos.y - mousePointTo.y * newScale,
      };

      dispatch(setStageScale(newScale));
      dispatch(setStageCoordinates(newCoordinates));
    }
      dispatch(setBrushSize(size));
    },
    [stageRef, isMoveStageKeyHeld, stageScale, dispatch, brushSize]
  );
};

export default useCanvasWheel;
