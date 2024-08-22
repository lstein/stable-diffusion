import type { JSONObject, SerializableObject } from 'common/types';
import { deepClone } from 'common/util/deepClone';
import type { CanvasManager } from 'features/controlLayers/konva/CanvasManager';
import { CanvasObjectRenderer } from 'features/controlLayers/konva/CanvasObjectRenderer';
import { CanvasTransformer } from 'features/controlLayers/konva/CanvasTransformer';
import type {
  CanvasControlLayerState,
  CanvasEntityIdentifier,
  CanvasRasterLayerState,
  CanvasV2State,
  Rect,
} from 'features/controlLayers/store/types';
import { getEntityIdentifier } from 'features/controlLayers/store/types';
import Konva from 'konva';
import type { GroupConfig } from 'konva/lib/Group';
import { get, omit } from 'lodash-es';
import type { Logger } from 'roarr';
import stableHash from 'stable-hash';
import { assert } from 'tsafe';

export class CanvasLayerAdapter {
  readonly type = 'layer_adapter';

  id: string;
  path: string[];
  manager: CanvasManager;
  log: Logger;

  state: CanvasRasterLayerState | CanvasControlLayerState;

  konva: {
    layer: Konva.Layer;
  };
  transformer: CanvasTransformer;
  renderer: CanvasObjectRenderer;

  isFirstRender: boolean = true;

  constructor(state: CanvasLayerAdapter['state'], manager: CanvasLayerAdapter['manager']) {
    this.id = state.id;
    this.manager = manager;
    this.path = this.manager.path.concat(this.id);
    this.log = this.manager.buildLogger(this.getLoggingContext);
    this.log.debug({ state }, 'Creating layer');
    this.state = state;

    this.konva = {
      layer: new Konva.Layer({
        // We need the ID on the layer to help with building the composite initial image
        // See `getCompositeLayerStageClone()`
        id: this.id,
        name: `${this.type}:layer`,
        listening: false,
        imageSmoothingEnabled: false,
      }),
    };

    this.renderer = new CanvasObjectRenderer(this);
    this.transformer = new CanvasTransformer(this);
  }

  /**
   * Get this entity's entity identifier
   */
  getEntityIdentifier = (): CanvasEntityIdentifier => {
    return getEntityIdentifier(this.state);
  };

  destroy = (): void => {
    this.log.debug('Destroying layer');
    // We need to call the destroy method on all children so they can do their own cleanup.
    this.transformer.destroy();
    this.renderer.destroy();
    this.konva.layer.destroy();
  };

  update = async (arg?: {
    state: CanvasLayerAdapter['state'];
    toolState: CanvasV2State['tool'];
    isSelected: boolean;
  }) => {
    const state = get(arg, 'state', this.state);

    if (!this.isFirstRender && state === this.state) {
      this.log.trace('State unchanged, skipping update');
      return;
    }

    this.log.debug('Updating');
    const { position, objects, opacity, isEnabled } = state;

    if (this.isFirstRender || isEnabled !== this.state.isEnabled) {
      this.updateVisibility({ isEnabled });
    }
    if (this.isFirstRender || objects !== this.state.objects) {
      await this.updateObjects({ objects });
    }
    if (this.isFirstRender || position !== this.state.position) {
      this.transformer.updatePosition({ position });
    }
    if (this.isFirstRender || opacity !== this.state.opacity) {
      this.renderer.updateOpacity(opacity);
    }

    if (state.type === 'control_layer' && this.state.type === 'control_layer') {
      if (this.isFirstRender || state.withTransparencyEffect !== this.state.withTransparencyEffect) {
        this.renderer.updateTransparencyEffect(state.withTransparencyEffect);
      }
    }
    // this.transformer.syncInteractionState();

    if (this.isFirstRender) {
      this.transformer.updateBbox();
    }

    this.state = state;
    this.isFirstRender = false;
  };

  updateVisibility = (arg?: { isEnabled: boolean }) => {
    this.log.trace('Updating visibility');
    const isEnabled = get(arg, 'isEnabled', this.state.isEnabled);
    this.konva.layer.visible(isEnabled);
    this.renderer.syncCache(isEnabled);
  };

  updateObjects = async (arg?: { objects: CanvasRasterLayerState['objects'] }) => {
    this.log.trace('Updating objects');

    const objects = get(arg, 'objects', this.state.objects);

    const didUpdate = await this.renderer.render(objects);

    if (didUpdate) {
      this.transformer.requestRectCalculation();
    }
  };

  repr = () => {
    return {
      id: this.id,
      type: this.type,
      state: deepClone(this.state),
      transformer: this.transformer.repr(),
      renderer: this.renderer.repr(),
    };
  };

  getLoggingContext = (): JSONObject => {
    return { ...this.manager.getLoggingContext(), path: this.path.join('.') };
  };

  getCanvas = (rect?: Rect): HTMLCanvasElement => {
    // TODO(psyche) - cache this - maybe with package `memoizee`? Would require careful review of cache invalidation
    this.log.trace({ rect }, 'Getting canvas');
    // The opacity may have been changed in response to user selecting a different entity category, so we must restore
    // the original opacity before rendering the canvas
    const attrs: GroupConfig = { opacity: this.state.opacity };
    const canvas = this.renderer.getCanvas(rect, attrs);
    return canvas;
  };

  getHashableState = (): SerializableObject => {
    if (this.state.type === 'control_layer') {
      const keysToOmit: (keyof CanvasControlLayerState)[] = ['name', 'controlAdapter', 'withTransparencyEffect'];
      return omit(this.state, keysToOmit);
    } else if (this.state.type === 'raster_layer') {
      const keysToOmit: (keyof CanvasRasterLayerState)[] = ['name'];
      return omit(this.state, keysToOmit);
    } else {
      assert(false, 'Unexpected layer type');
    }
  };

  hash = (extra?: SerializableObject): string => {
    const arg = {
      state: this.getHashableState(),
      extra,
    };
    return stableHash(arg);
  };

  logDebugInfo(msg = 'Debug info') {
    const info = {
      repr: this.repr(),
      interactionRectAttrs: {
        x: this.transformer.konva.proxyRect.x(),
        y: this.transformer.konva.proxyRect.y(),
        scaleX: this.transformer.konva.proxyRect.scaleX(),
        scaleY: this.transformer.konva.proxyRect.scaleY(),
        width: this.transformer.konva.proxyRect.width(),
        height: this.transformer.konva.proxyRect.height(),
        rotation: this.transformer.konva.proxyRect.rotation(),
      },
      objectGroupAttrs: {
        x: this.renderer.konva.objectGroup.x(),
        y: this.renderer.konva.objectGroup.y(),
        scaleX: this.renderer.konva.objectGroup.scaleX(),
        scaleY: this.renderer.konva.objectGroup.scaleY(),
        width: this.renderer.konva.objectGroup.width(),
        height: this.renderer.konva.objectGroup.height(),
        rotation: this.renderer.konva.objectGroup.rotation(),
        offsetX: this.renderer.konva.objectGroup.offsetX(),
        offsetY: this.renderer.konva.objectGroup.offsetY(),
      },
    };
    this.log.trace(info, msg);
  }
}