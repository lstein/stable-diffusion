import { $focusedRegion } from 'common/hooks/focus';
import type { CanvasManager } from 'features/controlLayers/konva/CanvasManager';
import { CanvasModuleBase } from 'features/controlLayers/konva/CanvasModuleBase';
import type { CanvasToolModule } from 'features/controlLayers/konva/CanvasTool/CanvasToolModule';
import { getPrefixedId } from 'features/controlLayers/konva/util';
import { noop } from 'lodash-es';
import type { Logger } from 'roarr';

export class CanvasMoveToolModule extends CanvasModuleBase {
  readonly type = 'move_tool';
  readonly id: string;
  readonly path: string[];
  readonly parent: CanvasToolModule;
  readonly manager: CanvasManager;
  readonly log: Logger;

  constructor(parent: CanvasToolModule) {
    super();
    this.id = getPrefixedId(this.type);
    this.parent = parent;
    this.manager = this.parent.manager;
    this.path = this.manager.buildPath(this);
    this.log = this.manager.buildLogger(this);
    this.log.debug('Creating module');
  }

  /**
   * This is a noop. Entity transformers handle cursor style when the move tool is active.
   */
  syncCursorStyle = noop;

  onKeyDown = (e: KeyboardEvent) => {
    // Support moving via arrow keys
    const OFFSET = 1; // How much to move, in px
    const offsets: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -OFFSET, y: 0 },
      ArrowRight: { x: OFFSET, y: 0 },
      ArrowUp: { x: 0, y: -OFFSET },
      ArrowDown: { x: 0, y: OFFSET },
    };
    const { key } = e;
    const selectedEntity = this.manager.stateApi.getSelectedEntityAdapter();
    const { x: offsetX = 0, y: offsetY = 0 } = offsets[key] || {};

    if (
      !(selectedEntity && selectedEntity.$isInteractable.get() && $focusedRegion.get() === 'canvas') ||
      (offsetX === 0 && offsetY === 0)
    ) {
      return; // Early return if no entity is selected or it is disabled or canvas is not focused
    }

    selectedEntity.transformer.nudgePosition(offsetX, offsetY);
  };
}
