import { deepClone } from 'common/util/deepClone';
import type { CanvasEntityAdapter } from 'features/controlLayers/konva/CanvasEntityAdapter/types';
import type { CanvasManager } from 'features/controlLayers/konva/CanvasManager';
import { CanvasModuleBase } from 'features/controlLayers/konva/CanvasModuleBase';
import { CanvasObjectBrushLine } from 'features/controlLayers/konva/CanvasObjectBrushLine';
import { CanvasObjectEraserLine } from 'features/controlLayers/konva/CanvasObjectEraserLine';
import { CanvasObjectImage } from 'features/controlLayers/konva/CanvasObjectImage';
import { CanvasObjectRect } from 'features/controlLayers/konva/CanvasObjectRect';
import { getPrefixedId } from 'features/controlLayers/konva/util';
import type {
  CanvasBrushLineState,
  CanvasEraserLineState,
  CanvasImageState,
  CanvasRectState,
} from 'features/controlLayers/store/types';
import Konva from 'konva';
import type { Logger } from 'roarr';
import { assert } from 'tsafe';

/**
 * Union of all object renderers.
 */
type AnyObjectRenderer = CanvasObjectBrushLine | CanvasObjectEraserLine | CanvasObjectRect | CanvasObjectImage;
/**
 * Union of all object states.
 */
type AnyObjectState = CanvasBrushLineState | CanvasEraserLineState | CanvasImageState | CanvasRectState;

/**
 * Handles rendering of objects for a canvas entity.
 */
export class CanvasEntityBufferObjectRenderer extends CanvasModuleBase {
  readonly type = 'buffer_renderer';
  readonly id: string;
  readonly path: string[];
  readonly parent: CanvasEntityAdapter;
  readonly manager: CanvasManager;
  readonly log: Logger;

  /**
   * A set of subscriptions that should be cleaned up when the transformer is destroyed.
   */
  subscriptions: Set<() => void> = new Set();

  /**
   * A buffer object state that is rendered separately from the other objects. This is used for objects that are being
   * drawn in real-time, such as brush lines. The buffer object state only exists in this renderer and is not part of
   * the application state until it is committed.
   */
  state: AnyObjectState | null = null;

  /**
   * The object renderer for the buffer object state. It is created when the buffer object state is set and destroyed
   * when the buffer object state is cleared. This is separate from the other object renderers to allow the buffer to
   * be rendered separately.
   */
  renderer: AnyObjectRenderer | null = null;

  /**
   * A object containing singleton Konva nodes.
   */
  konva: {
    /**
     * A Konva Group that holds the buffer object renderer.
     */
    group: Konva.Group;
  };

  constructor(parent: CanvasEntityAdapter) {
    super();
    this.id = getPrefixedId(this.type);
    this.parent = parent;
    this.manager = parent.manager;
    this.path = this.manager.buildPath(this);
    this.log = this.manager.buildLogger(this);
    this.log.debug('Creating module');

    this.konva = {
      group: new Konva.Group({ name: `${this.type}:buffer_group`, listening: false }),
    };

    this.parent.konva.layer.add(this.konva.group);

    // When switching tool, commit the buffer. This is necessary to prevent the buffer from being lost when the
    // user switches tool mid-drawing, for example by pressing space to pan the stage. It's easy to press space
    // to pan _before_ releasing the mouse button, which would cause the buffer to be lost if we didn't commit it.
    this.subscriptions.add(
      this.manager.tool.$tool.listen(() => {
        if (this.hasBuffer() && !this.manager.$isBusy.get()) {
          this.commitBuffer();
        }
      })
    );
  }

  /**
   * Renders the buffer object. If the buffer renderer does not exist, it will be created and its Konva group added to the
   * parent entity's buffer object group.
   * @returns A promise that resolves to a boolean, indicating if the object was rendered.
   */
  renderBufferObject = async (): Promise<boolean> => {
    let didRender = false;

    if (!this.state) {
      return false;
    }

    if (this.state.type === 'brush_line') {
      assert(this.renderer instanceof CanvasObjectBrushLine || !this.renderer);

      if (!this.renderer) {
        this.renderer = new CanvasObjectBrushLine(this.state, this);
        this.konva.group.add(this.renderer.konva.group);
      }

      didRender = this.renderer.update(this.state, true);
    } else if (this.state.type === 'eraser_line') {
      assert(this.renderer instanceof CanvasObjectEraserLine || !this.renderer);

      if (!this.renderer) {
        this.renderer = new CanvasObjectEraserLine(this.state, this);
        this.konva.group.add(this.renderer.konva.group);
      }

      didRender = this.renderer.update(this.state, true);
    } else if (this.state.type === 'rect') {
      assert(this.renderer instanceof CanvasObjectRect || !this.renderer);

      if (!this.renderer) {
        this.renderer = new CanvasObjectRect(this.state, this);
        this.konva.group.add(this.renderer.konva.group);
      }

      didRender = this.renderer.update(this.state, true);
    } else if (this.state.type === 'image') {
      assert(this.renderer instanceof CanvasObjectImage || !this.renderer);

      if (!this.renderer) {
        this.renderer = new CanvasObjectImage(this.state, this);
        this.konva.group.add(this.renderer.konva.group);
      }
      didRender = await this.renderer.update(this.state, true);
    }

    return didRender;
  };

  /**
   * Determines if the renderer has a buffer object to render.
   * @returns Whether the renderer has a buffer object to render.
   */
  hasBuffer = (): boolean => {
    return this.state !== null || this.renderer !== null;
  };

  /**
   * Sets the buffer object state to render.
   * @param objectState The object state to set as the buffer.
   * @param resetBufferOffset Whether to reset the buffer's offset to 0,0. This is necessary when previewing filters.
   * When previewing a filter, the buffer object is an image of the same size as the entity, so it should be rendered
   * at the top-left corner of the entity.
   * @returns A promise that resolves to a boolean, indicating if the object was rendered.
   */
  setBuffer = async (objectState: AnyObjectState, resetBufferOffset: boolean = false): Promise<boolean> => {
    this.log.trace('Setting buffer');

    this.state = objectState;
    if (resetBufferOffset) {
      this.konva.group.offset({ x: 0, y: 0 });
    }
    return await this.renderBufferObject();
  };

  /**
   * Clears the buffer object state.
   */
  clearBuffer = () => {
    if (this.state || this.renderer) {
      this.log.trace('Clearing buffer');
      this.renderer?.destroy();
      this.renderer = null;
      this.state = null;
    }
  };

  /**
   * Commits the current buffer object, pushing the buffer object state back to the application state.
   */
  commitBuffer = (options?: { pushToState?: boolean }) => {
    const { pushToState } = { ...options, pushToState: true };

    if (!this.state || !this.renderer) {
      this.log.trace('No buffer to commit');
      return;
    }

    this.log.trace('Committing buffer');

    // Move the buffer to the persistent objects group/renderers
    this.parent.renderer.adoptObjectRenderer(this.renderer);

    if (pushToState) {
      const entityIdentifier = this.parent.entityIdentifier;
      if (this.state.type === 'brush_line') {
        this.manager.stateApi.addBrushLine({ entityIdentifier, brushLine: this.state });
      } else if (this.state.type === 'eraser_line') {
        this.manager.stateApi.addEraserLine({ entityIdentifier, eraserLine: this.state });
      } else if (this.state.type === 'rect') {
        this.manager.stateApi.addRect({ entityIdentifier, rect: this.state });
      } else {
        this.log.warn({ buffer: this.state }, 'Invalid buffer object type');
      }
    }

    this.renderer = null;
    this.state = null;
  };

  destroy = () => {
    this.log.debug('Destroying module');
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions.clear();
    if (this.renderer) {
      this.renderer.destroy();
    }
  };

  repr = () => {
    return {
      id: this.id,
      type: this.type,
      path: this.path,
      parent: this.parent.id,
      bufferState: deepClone(this.state),
      bufferRenderer: this.renderer?.repr(),
    };
  };
}
