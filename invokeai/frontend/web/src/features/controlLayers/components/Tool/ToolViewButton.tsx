import { IconButton } from '@invoke-ai/ui-library';
import { useSelectTool, useToolIsSelected } from 'features/controlLayers/components/Tool/hooks';
import { useRegisteredHotkeys } from 'features/system/components/HotkeysModal/useHotkeyData';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PiHandBold } from 'react-icons/pi';

export const ToolViewButton = memo(() => {
  const { t } = useTranslation();
  const isSelected = useToolIsSelected('view');
  const selectView = useSelectTool('view');

  useRegisteredHotkeys({
    id: 'selectViewTool',
    category: 'canvas',
    callback: selectView,
    options: { enabled: !isSelected },
    dependencies: [selectView, isSelected],
  });

  return (
    <IconButton
      aria-label={`${t('controlLayers.tool.view')} (H)`}
      tooltip={`${t('controlLayers.tool.view')} (H)`}
      icon={<PiHandBold />}
      colorScheme={isSelected ? 'invokeBlue' : 'base'}
      variant="solid"
      onClick={selectView}
      isDisabled={isSelected}
    />
  );
});

ToolViewButton.displayName = 'ToolViewButton';
