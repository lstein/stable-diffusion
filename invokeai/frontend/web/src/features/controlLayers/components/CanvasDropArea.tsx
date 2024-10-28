import { Grid, GridItem } from '@invoke-ai/ui-library';
import { Dnd } from 'features/dnd2/dnd';
import { DndDropTarget } from 'features/dnd2/DndDropTarget';
import { useImageViewer } from 'features/gallery/components/ImageViewer/useImageViewer';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const addRasterLayerFromImageDndTargetData = Dnd.Target.newRasterLayerFromImage.getData();
const addControlLayerFromImageDndTargetData = Dnd.Target.newControlLayerFromImage.getData();
const addRegionalGuidanceReferenceImageFromImageDndTargetData =
  Dnd.Target.newRegionalGuidanceReferenceImageFromImage.getData();
const addGlobalReferenceImageFromImageDndTargetData = Dnd.Target.newGlobalReferenceImageFromImage.getData();

export const CanvasDropArea = memo(() => {
  const { t } = useTranslation();
  const imageViewer = useImageViewer();

  if (imageViewer.isOpen) {
    return null;
  }

  return (
    <>
      <Grid
        gridTemplateRows="1fr 1fr"
        gridTemplateColumns="1fr 1fr"
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        pointerEvents="none"
      >
        <GridItem position="relative">
          <DndDropTarget
            label={t('controlLayers.canvasContextMenu.newRasterLayer')}
            targetData={addRasterLayerFromImageDndTargetData}
          />
        </GridItem>
        <GridItem position="relative">
          <DndDropTarget
            label={t('controlLayers.canvasContextMenu.newControlLayer')}
            targetData={addControlLayerFromImageDndTargetData}
          />
        </GridItem>

        <GridItem position="relative">
          <DndDropTarget
            label={t('controlLayers.canvasContextMenu.newRegionalReferenceImage')}
            targetData={addRegionalGuidanceReferenceImageFromImageDndTargetData}
          />
        </GridItem>
        <GridItem position="relative">
          <DndDropTarget
            label={t('controlLayers.canvasContextMenu.newGlobalReferenceImage')}
            targetData={addGlobalReferenceImageFromImageDndTargetData}
          />
        </GridItem>
      </Grid>
    </>
  );
});

CanvasDropArea.displayName = 'CanvasDropArea';
