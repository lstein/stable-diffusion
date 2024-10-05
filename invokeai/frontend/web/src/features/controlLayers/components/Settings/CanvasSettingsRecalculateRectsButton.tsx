import { Button } from '@invoke-ai/ui-library';
import { useCanvasManager } from 'features/controlLayers/contexts/CanvasManagerProviderGate';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const CanvasSettingsRecalculateRectsButton = memo(() => {
  const { t } = useTranslation();
  const canvasManager = useCanvasManager();
  const onPointerUp = useCallback(() => {
    for (const adapter of canvasManager.getAllAdapters()) {
      adapter.transformer.requestRectCalculation();
    }
  }, [canvasManager]);

  return (
    <Button onPointerUp={onPointerUp} size="sm" colorScheme="warning">
      {t('controlLayers.recalculateRects')}
    </Button>
  );
});

CanvasSettingsRecalculateRectsButton.displayName = 'CanvasSettingsRecalculateRectsButton';
