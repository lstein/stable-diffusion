import { Progress } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { $isConnected } from 'app/hooks/useSocketIO';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetCurrentQueueItemQuery, useGetQueueStatusQuery } from 'services/api/endpoints/queue';
import { $lastProgressEvent } from 'services/events/setEventListeners';

const ProgressBar = () => {
  const { t } = useTranslation();
  const { data: queueStatus } = useGetQueueStatusQuery();
  const currentQueueItem = useGetCurrentQueueItemQuery().data;
  const isConnected = useStore($isConnected);
  const lastProgressEvent = useStore($lastProgressEvent);
  const value = useMemo(() => {
    if (!lastProgressEvent) {
      return 0;
    }
    return (lastProgressEvent.percentage ?? 0) * 100;
  }, [lastProgressEvent]);

  return (
    <Progress
      value={value}
      aria-label={t('accessibility.invokeProgressBar')}
      isIndeterminate={isConnected && Boolean(queueStatus?.queue.in_progress) && !lastProgressEvent}
      h={2}
      w="full"
      colorScheme={currentQueueItem && currentQueueItem.destination === 'canvas' ? 'invokeGreen' : 'invokeBlue'}
    />
  );
};

export default memo(ProgressBar);
