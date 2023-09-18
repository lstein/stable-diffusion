import { MenuItem } from '@chakra-ui/react';
import { memo, useCallback } from 'react';
import { FaTrash } from 'react-icons/fa';
import { BoardDTO } from 'services/api/types';
import { useTranslation } from 'react-i18next';

type Props = {
  board: BoardDTO;
  setBoardToDelete?: (board?: BoardDTO) => void;
  isLocked: boolean;
};

const GalleryBoardContextMenuItems = ({
  board,
  setBoardToDelete,
  isLocked,
}: Props) => {
  const handleDelete = useCallback(() => {
    if (!setBoardToDelete || isLocked) {
      return;
    }
    setBoardToDelete(board);
  }, [board, setBoardToDelete, isLocked]);

  const { t } = useTranslation();

  return (
    <>
      {board.image_count > 0 && (
        <>
          {/* <MenuItem
                    isDisabled={!board.image_count}
                    icon={<FaImages />}
                    onClickCapture={handleAddBoardToBatch}
                  >
                    Add Board to Batch
                  </MenuItem> */}
        </>
      )}
      <MenuItem
        sx={{ color: 'error.600', _dark: { color: 'error.300' } }}
        icon={<FaTrash />}
        onClick={handleDelete}
        isDisabled={isLocked}
      >
        {t('boards.deleteBoard')}
      </MenuItem>
    </>
  );
};
export default memo(GalleryBoardContextMenuItems);
