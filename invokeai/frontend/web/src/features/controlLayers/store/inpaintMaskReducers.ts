import type { PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit';
import { getPrefixedId } from 'features/controlLayers/konva/util';
import { selectEntity } from 'features/controlLayers/store/selectors';
import type {
  CanvasInpaintMaskState,
  CanvasState,
  EntityIdentifierPayload,
  FillStyle,
  RgbColor,
} from 'features/controlLayers/store/types';
import { getEntityIdentifier } from 'features/controlLayers/store/types';
import { merge } from 'lodash-es';

export const inpaintMaskReducers = {
  inpaintMaskAdded: {
    reducer: (
      state,
      action: PayloadAction<{ id: string; overrides?: Partial<CanvasInpaintMaskState>; isSelected?: boolean }>
    ) => {
      const { id, overrides, isSelected } = action.payload;
      const entity: CanvasInpaintMaskState = {
        id,
        name: null,
        type: 'inpaint_mask',
        isEnabled: true,
        objects: [],
        opacity: 1,
        position: { x: 0, y: 0 },
        fill: {
          style: 'diagonal',
          color: { r: 255, g: 122, b: 0 }, // some orange color
        },
      };
      merge(entity, overrides);
      state.inpaintMasks.entities.push(entity);
      if (isSelected) {
        state.selectedEntityIdentifier = getEntityIdentifier(entity);
      }
    },
    prepare: (payload?: { overrides?: Partial<CanvasInpaintMaskState>; isSelected?: boolean }) => ({
      payload: { ...payload, id: getPrefixedId('inpaint_mask') },
    }),
  },
  inpaintMaskRecalled: (state, action: PayloadAction<{ data: CanvasInpaintMaskState }>) => {
    const { data } = action.payload;
    state.inpaintMasks.entities = [data];
    state.selectedEntityIdentifier = { type: 'inpaint_mask', id: data.id };
  },
  inpaintMaskFillColorChanged: (
    state,
    action: PayloadAction<EntityIdentifierPayload<{ color: RgbColor }, 'inpaint_mask'>>
  ) => {
    const { color, entityIdentifier } = action.payload;
    const entity = selectEntity(state, entityIdentifier);
    if (!entity) {
      return;
    }
    entity.fill.color = color;
  },
  inpaintMaskFillStyleChanged: (
    state,
    action: PayloadAction<EntityIdentifierPayload<{ style: FillStyle }, 'inpaint_mask'>>
  ) => {
    const { style, entityIdentifier } = action.payload;
    const entity = selectEntity(state, entityIdentifier);
    if (!entity) {
      return;
    }
    entity.fill.style = style;
  },
} satisfies SliceCaseReducers<CanvasState>;
