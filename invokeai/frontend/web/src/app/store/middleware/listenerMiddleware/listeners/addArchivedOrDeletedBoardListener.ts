import { isAnyOf } from '@reduxjs/toolkit';
import type { AppStartListening } from 'app/store/middleware/listenerMiddleware';
import { selectListBoardsQueryArgs } from 'features/gallery/store/gallerySelectors';
import {
  autoAddBoardIdChanged,
  boardIdSelected,
  galleryViewChanged,
  shouldShowArchivedBoardsChanged,
} from 'features/gallery/store/gallerySlice';
import { boardsApi } from 'services/api/endpoints/boards';
import { imagesApi } from 'services/api/endpoints/images';

export const addArchivedOrDeletedBoardListener = (startAppListening: AppStartListening) => {
  /**
   * The auto-add board shouldn't be set to an archived board or deleted board. When we archive a board, delete
   * a board, or change a the archived board visibility flag, we may need to reset the auto-add board.
   */
  startAppListening({
    matcher: isAnyOf(
      // If a board is deleted, we'll need to reset the auto-add board
      imagesApi.endpoints.deleteBoard.matchFulfilled,
      imagesApi.endpoints.deleteBoardAndImages.matchFulfilled
    ),
    effect: async (action, { dispatch, getState }) => {
      const state = getState();
      const queryArgs = selectListBoardsQueryArgs(state);
      const queryResult = boardsApi.endpoints.listAllBoards.select(queryArgs)(state);
      const { autoAddBoardId, selectedBoardId } = state.gallery;

      if (!queryResult.data) {
        return;
      }

      if (!queryResult.data.find((board) => board.board_id === selectedBoardId)) {
        dispatch(boardIdSelected({ boardId: 'none' }));
        dispatch(galleryViewChanged('images'));
      }
      if (!queryResult.data.find((board) => board.board_id === autoAddBoardId)) {
        dispatch(autoAddBoardIdChanged('none'));
      }
    },
  });

  // If we archived a board, it may end up hidden. If it's selected or the auto-add board, we should reset those.
  startAppListening({
    matcher: boardsApi.endpoints.updateBoard.matchFulfilled,
    effect: async (action, { dispatch, getState }) => {
      const state = getState();
      const queryArgs = selectListBoardsQueryArgs(state);
      const queryResult = boardsApi.endpoints.listAllBoards.select(queryArgs)(state);
      const { shouldShowArchivedBoards } = state.gallery;

      if (!queryResult.data) {
        return;
      }

      const wasArchived = action.meta.arg.originalArgs.changes.archived === true;

      if (wasArchived && !shouldShowArchivedBoards) {
        dispatch(autoAddBoardIdChanged('none'));
        dispatch(boardIdSelected({ boardId: 'none' }));
        dispatch(galleryViewChanged('images'));
      }
    },
  });

  // When we hide archived boards, if the selected or the auto-add board is archived, we should reset those.
  startAppListening({
    actionCreator: shouldShowArchivedBoardsChanged,
    effect: async (action, { dispatch, getState }) => {
      const shouldShowArchivedBoards = action.payload;

      // We only need to take action if we have just hidden archived boards.
      if (shouldShowArchivedBoards) {
        return;
      }

      const state = getState();
      const queryArgs = selectListBoardsQueryArgs(state);
      const queryResult = boardsApi.endpoints.listAllBoards.select(queryArgs)(state);
      const { selectedBoardId, autoAddBoardId } = state.gallery;

      if (!queryResult.data) {
        return;
      }

      // Handle the case where selected board is archived
      const selectedBoard = queryResult.data.find((b) => b.board_id === selectedBoardId);
      if (!selectedBoard || selectedBoard.archived) {
        // If we can't find the selected board or it's archived, we should reset the selected board to uncategorized
        dispatch(boardIdSelected({ boardId: 'none' }));
        dispatch(galleryViewChanged('images'));
      }

      // Handle the case where auto-add board is archived
      const autoAddBoard = queryResult.data.find((b) => b.board_id === autoAddBoardId);
      if (!autoAddBoard || autoAddBoard.archived) {
        // If we can't find the auto-add board or it's archived, we should reset the selected board to uncategorized
        dispatch(autoAddBoardIdChanged('none'));
      }
    },
  });

  /**
   * When listing boards, if the selected or auto-add boards are no longer in the list, we should reset them.
   */
  startAppListening({
    matcher: boardsApi.endpoints.listAllBoards.matchFulfilled,
    effect: async (action, { dispatch, getState }) => {
      const boards = action.payload;
      const state = getState();
      const { selectedBoardId, autoAddBoardId } = state.gallery;

      // Handle the case where selected board isn't in the list of boards
      if (!boards.find((b) => b.board_id === selectedBoardId)) {
        dispatch(boardIdSelected({ boardId: 'none' }));
        dispatch(galleryViewChanged('images'));
      }

      // Handle the case where auto-add board isn't in the list of boards
      if (!boards.find((b) => b.board_id === autoAddBoardId)) {
        dispatch(autoAddBoardIdChanged('none'));
      }
    },
  });
};
