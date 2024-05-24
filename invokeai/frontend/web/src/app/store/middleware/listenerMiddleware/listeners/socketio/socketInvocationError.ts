import { logger } from 'app/logging/logger';
import type { AppStartListening } from 'app/store/middleware/listenerMiddleware';
import { deepClone } from 'common/util/deepClone';
import { $nodeExecutionStates, upsertExecutionState } from 'features/nodes/hooks/useExecutionState';
import { zNodeStatus } from 'features/nodes/types/invocation';
import { socketInvocationError } from 'services/events/actions';

const log = logger('socketio');

export const addInvocationErrorEventListener = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: socketInvocationError,
    effect: (action) => {
      log.error(action.payload, `Invocation error (${action.payload.data.node.type})`);
      const { source_node_id, error_type, error_message, error_traceback } = action.payload.data;
      const nes = deepClone($nodeExecutionStates.get()[source_node_id]);
      if (nes) {
        nes.status = zNodeStatus.enum.FAILED;
        nes.progress = null;
        nes.progressImage = null;
        nes.error = {
          error_type,
          error_message,
          error_traceback,
        };
        upsertExecutionState(nes.nodeId, nes);
      }
    },
  });
};
