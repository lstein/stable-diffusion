import { Box, Flex } from '@chakra-ui/react';
import { skipToken } from '@reduxjs/toolkit/query';
import { createMemoizedSelector } from 'app/store/createMemoizedSelector';
import { stateSelector } from 'app/store/store';
import { useAppSelector } from 'app/store/storeHooks';
import IAIDndImage from 'common/components/IAIDndImage';
import { IAINoContentFallback } from 'common/components/IAIImageFallback';
import type {
  TypesafeDraggableData,
  TypesafeDroppableData,
} from 'features/dnd/types';
import ProgressImage from 'features/gallery/components/CurrentImage/ProgressImage';
import ImageMetadataViewer from 'features/gallery/components/ImageMetadataViewer/ImageMetadataViewer';
import NextPrevImageButtons from 'features/gallery/components/NextPrevImageButtons';
import { useNextPrevImage } from 'features/gallery/hooks/useNextPrevImage';
import { selectLastSelectedImage } from 'features/gallery/store/gallerySelectors';
import type { AnimationProps} from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';
import type {
  CSSProperties} from 'react';
import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { FaImage } from 'react-icons/fa';
import { useGetImageDTOQuery } from 'services/api/endpoints/images';

export const imagesSelector = createMemoizedSelector(
  [stateSelector, selectLastSelectedImage],
  ({ ui, system }, lastSelectedImage) => {
    const {
      shouldShowImageDetails,
      shouldHidePreview,
      shouldShowProgressInViewer,
    } = ui;
    const { denoiseProgress } = system;
    return {
      shouldShowImageDetails,
      shouldHidePreview,
      imageName: lastSelectedImage?.image_name,
      hasDenoiseProgress: Boolean(denoiseProgress),
      shouldShowProgressInViewer,
    };
  }
);

const CurrentImagePreview = () => {
  const {
    shouldShowImageDetails,
    imageName,
    hasDenoiseProgress,
    shouldShowProgressInViewer,
  } = useAppSelector(imagesSelector);

  const {
    handlePrevImage,
    handleNextImage,
    isOnLastImage,
    handleLoadMoreImages,
    areMoreImagesAvailable,
    isFetching,
  } = useNextPrevImage();

  useHotkeys(
    'left',
    () => {
      handlePrevImage();
    },
    [handlePrevImage]
  );

  useHotkeys(
    'right',
    () => {
      if (isOnLastImage && areMoreImagesAvailable && !isFetching) {
        handleLoadMoreImages();
        return;
      }
      if (!isOnLastImage) {
        handleNextImage();
      }
    },
    [
      isOnLastImage,
      areMoreImagesAvailable,
      handleLoadMoreImages,
      isFetching,
      handleNextImage,
    ]
  );

  const { currentData: imageDTO } = useGetImageDTOQuery(imageName ?? skipToken);

  const draggableData = useMemo<TypesafeDraggableData | undefined>(() => {
    if (imageDTO) {
      return {
        id: 'current-image',
        payloadType: 'IMAGE_DTO',
        payload: { imageDTO },
      };
    }
  }, [imageDTO]);

  const droppableData = useMemo<TypesafeDroppableData | undefined>(
    () => ({
      id: 'current-image',
      actionType: 'SET_CURRENT_IMAGE',
    }),
    []
  );

  // Show and hide the next/prev buttons on mouse move
  const [shouldShowNextPrevButtons, setShouldShowNextPrevButtons] =
    useState<boolean>(false);

  const timeoutId = useRef(0);

  const { t } = useTranslation();

  const handleMouseOver = useCallback(() => {
    setShouldShowNextPrevButtons(true);
    window.clearTimeout(timeoutId.current);
  }, []);

  const handleMouseOut = useCallback(() => {
    timeoutId.current = window.setTimeout(() => {
      setShouldShowNextPrevButtons(false);
    }, 500);
  }, []);

  return (
    <Flex
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      width="full"
      height="full"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      {hasDenoiseProgress && shouldShowProgressInViewer ? (
        <ProgressImage />
      ) : (
        <IAIDndImage
          imageDTO={imageDTO}
          droppableData={droppableData}
          draggableData={draggableData}
          isUploadDisabled={true}
          fitContainer
          useThumbailFallback
          dropLabel={t('gallery.setCurrentImage')}
          noContentFallback={
            <IAINoContentFallback
              icon={FaImage}
              label={t('gallery.noImageSelected')}
            />
          }
          dataTestId="image-preview"
        />
      )}
      {shouldShowImageDetails && imageDTO && (
        <Box
          position="absolute"
          top="0"
          width="full"
          height="full"
          borderRadius="base"
        >
          <ImageMetadataViewer image={imageDTO} />
        </Box>
      )}
      <AnimatePresence>
        {!shouldShowImageDetails && imageDTO && shouldShowNextPrevButtons && (
          <motion.div
            key="nextPrevButtons"
            initial={initial}
            animate={animate}
            exit={exit}
            style={motionStyles}
          >
            <NextPrevImageButtons />
          </motion.div>
        )}
      </AnimatePresence>
    </Flex>
  );
};

export default memo(CurrentImagePreview);

const initial: AnimationProps['initial'] = {
  opacity: 0,
};
const animate: AnimationProps['animate'] = {
  opacity: 1,
  transition: { duration: 0.1 },
};
const exit: AnimationProps['exit'] = {
  opacity: 0,
  transition: { duration: 0.1 },
};
const motionStyles: CSSProperties = {
  position: 'absolute',
  top: '0',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
};
