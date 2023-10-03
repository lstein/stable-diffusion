import { Flex, ButtonGroup } from '@chakra-ui/react';
import { memo } from 'react';
import LoadWorkflowButton from './LoadWorkflowButton';
import ResetWorkflowButton from './ResetWorkflowButton';
import DownloadWorkflowButton from './DownloadWorkflowButton';
import UndoRedoButton from './UndoRedoButton';

const TopCenterPanel = () => {
  return (
    <Flex
      sx={{
        gap: 2,
        position: 'absolute',
        top: 2,
        insetInlineStart: '50%',
        transform: 'translate(-50%)',
      }}
    >
      <ButtonGroup isAttached>
        <DownloadWorkflowButton />
        <LoadWorkflowButton />
      </ButtonGroup>
      <UndoRedoButton />
      <ResetWorkflowButton />
    </Flex>
  );
};

export default memo(TopCenterPanel);
