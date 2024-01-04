import { SpinnerIcon } from '@chakra-ui/icons';
import type { SystemStyleObject } from '@chakra-ui/react';
import { Flex, Portal } from '@chakra-ui/react';
import { InvButtonGroup } from 'common/components/InvButtonGroup/InvButtonGroup';
import { InvIconButton } from 'common/components/InvIconButton/InvIconButton';
import CancelCurrentQueueItemIconButton from 'features/queue/components/CancelCurrentQueueItemIconButton';
import ClearQueueIconButton from 'features/queue/components/ClearQueueIconButton';
import { QueueButtonTooltip } from 'features/queue/components/QueueButtonTooltip';
import { useQueueBack } from 'features/queue/hooks/useQueueBack';
import type { UsePanelReturn } from 'features/ui/hooks/usePanel';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSlidersH } from 'react-icons/fa';
import { IoSparkles } from 'react-icons/io5';
import { useGetQueueStatusQuery } from 'services/api/endpoints/queue';
import { spinAnimationSlow } from 'theme/animations';

const floatingButtonStyles: SystemStyleObject = {
  borderStartRadius: 0,
  flexGrow: 1,
};

type Props = {
  panelApi: UsePanelReturn;
};

const FloatingSidePanelButtons = (props: Props) => {
  const { t } = useTranslation();
  const { queueBack, isLoading, isDisabled } = useQueueBack();
  const { data: queueStatus } = useGetQueueStatusQuery();

  const queueButtonIcon = useMemo(
    () =>
      queueStatus?.processor.is_processing ? (
        <SpinnerIcon animation={spinAnimationSlow} />
      ) : (
        <IoSparkles />
      ),
    [queueStatus?.processor.is_processing]
  );

  if (!props.panelApi.isCollapsed) {
    return null;
  }

  return (
    <Portal>
      <Flex
        pos="absolute"
        transform="translate(0, -50%)"
        minW={8}
        top="50%"
        insetInlineStart="54px"
        direction="column"
        gap={2}
        h={48}
      >
        <InvButtonGroup orientation="vertical" flexGrow={3}>
          <InvIconButton
            tooltip={t('parameters.showOptionsPanel')}
            aria-label={t('parameters.showOptionsPanel')}
            onClick={props.panelApi.expand}
            sx={floatingButtonStyles}
            icon={<FaSlidersH />}
          />
          <InvIconButton
            aria-label={t('queue.queueBack')}
            onClick={queueBack}
            isLoading={isLoading}
            isDisabled={isDisabled}
            icon={queueButtonIcon}
            colorScheme="invokeYellow"
            tooltip={<QueueButtonTooltip />}
            sx={floatingButtonStyles}
          />
          <CancelCurrentQueueItemIconButton sx={floatingButtonStyles} />
        </InvButtonGroup>
        <ClearQueueIconButton sx={floatingButtonStyles} />
      </Flex>
    </Portal>
  );
};

export default memo(FloatingSidePanelButtons);
