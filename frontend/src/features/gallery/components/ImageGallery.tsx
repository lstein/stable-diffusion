import { Button } from '@chakra-ui/button';
import { NumberSize, Resizable } from 're-resizable';

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { MdPhotoLibrary } from 'react-icons/md';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import { requestImages } from 'app/socketio/actions';
import { useAppDispatch, useAppSelector } from 'app/store';
import IAIIconButton from 'common/components/IAIIconButton';
import {
  selectNextImage,
  selectPrevImage,
  setCurrentCategory,
  setGalleryImageMinimumWidth,
  setGalleryImageObjectFit,
  setGalleryScrollPosition,
  setGalleryWidth,
  setShouldAutoSwitchToNewImages,
  setShouldHoldGalleryOpen,
  setShouldPinGallery,
} from 'features/gallery/store/gallerySlice';
import HoverableImage from './HoverableImage';
import { setShouldShowGallery } from 'features/gallery/store/gallerySlice';
import { ButtonGroup, useToast } from '@chakra-ui/react';
import { CSSTransition } from 'react-transition-group';
import { Direction } from 're-resizable/lib/resizer';
import { imageGallerySelector } from 'features/gallery/store/gallerySliceSelectors';
import { FaImage, FaUser, FaWrench } from 'react-icons/fa';
import IAIPopover from 'common/components/IAIPopover';
import IAISlider from 'common/components/IAISlider';
import { BiReset } from 'react-icons/bi';
import IAICheckbox from 'common/components/IAICheckbox';
import { setDoesCanvasNeedScaling } from 'features/canvas/store/canvasSlice';
import _ from 'lodash';
import IAIButton from 'common/components/IAIButton';

const GALLERY_SHOW_BUTTONS_MIN_WIDTH = 320;

export default function ImageGallery() {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const {
    images,
    currentCategory,
    currentImageUuid,
    shouldPinGallery,
    shouldShowGallery,
    galleryScrollPosition,
    galleryImageMinimumWidth,
    galleryGridTemplateColumns,
    activeTabName,
    galleryImageObjectFit,
    shouldHoldGalleryOpen,
    shouldAutoSwitchToNewImages,
    areMoreImagesAvailable,
    galleryWidth,
    isLightBoxOpen,
    isStaging,
  } = useAppSelector(imageGallerySelector);

  const [galleryMinWidth, setGalleryMinWidth] = useState<number>(300);
  const [galleryMaxWidth, setGalleryMaxWidth] = useState<number>(590);

  const [shouldShowButtons, setShouldShowButtons] = useState<boolean>(
    galleryWidth >= GALLERY_SHOW_BUTTONS_MIN_WIDTH
  );

  useLayoutEffect(() => {
    if (!shouldPinGallery) return;

    if (isLightBoxOpen) {
      dispatch(setGalleryWidth(400));
      setGalleryMinWidth(400);
      setGalleryMaxWidth(400);
      return;
    }

    if (activeTabName === 'unifiedCanvas') {
      setGalleryMinWidth(190);
      setGalleryMaxWidth(450);
      dispatch(setDoesCanvasNeedScaling(true));
    } else if (activeTabName === 'img2img') {
      dispatch(
        setGalleryWidth(Math.min(Math.max(Number(galleryWidth), 0), 490))
      );
      setGalleryMaxWidth(490);
    } else {
      dispatch(
        setGalleryWidth(Math.min(Math.max(Number(galleryWidth), 0), 590))
      );
      setGalleryMaxWidth(590);
    }
  }, [dispatch, activeTabName, shouldPinGallery, galleryWidth, isLightBoxOpen]);

  useLayoutEffect(() => {
    if (!shouldPinGallery) {
      setGalleryMaxWidth(window.innerWidth);
    }
  }, [shouldPinGallery, isLightBoxOpen]);

  const galleryRef = useRef<HTMLDivElement>(null);
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const timeoutIdRef = useRef<number | null>(null);

  const handleSetShouldPinGallery = () => {
    dispatch(setShouldPinGallery(!shouldPinGallery));
    dispatch(setDoesCanvasNeedScaling(true));
  };

  const handleToggleGallery = () => {
    shouldShowGallery ? handleCloseGallery() : handleOpenGallery();
  };

  const handleOpenGallery = () => {
    dispatch(setShouldShowGallery(true));
    shouldPinGallery && dispatch(setDoesCanvasNeedScaling(true));
  };

  const handleCloseGallery = useCallback(() => {
    dispatch(setShouldShowGallery(false));
    dispatch(setShouldHoldGalleryOpen(false));
    dispatch(
      setGalleryScrollPosition(
        galleryContainerRef.current ? galleryContainerRef.current.scrollTop : 0
      )
    );
  }, [dispatch]);

  const handleClickLoadMore = () => {
    dispatch(requestImages(currentCategory));
  };

  const handleChangeGalleryImageMinimumWidth = (v: number) => {
    dispatch(setGalleryImageMinimumWidth(v));
    // dispatch(setDoesCanvasNeedScaling(true));
  };

  const setCloseGalleryTimer = () => {
    if (shouldHoldGalleryOpen) return;
    timeoutIdRef.current = window.setTimeout(() => handleCloseGallery(), 500);
  };

  const cancelCloseGalleryTimer = () => {
    timeoutIdRef.current && window.clearTimeout(timeoutIdRef.current);
  };

  useHotkeys(
    'g',
    () => {
      handleToggleGallery();
    },
    [shouldShowGallery, shouldPinGallery]
  );

  useHotkeys(
    'left',
    () => {
      dispatch(selectPrevImage());
    },
    {
      enabled: !isStaging,
    },
    [isStaging]
  );

  useHotkeys(
    'right',
    () => {
      dispatch(selectNextImage());
    },
    {
      enabled: !isStaging,
    },
    [isStaging]
  );

  useHotkeys(
    'shift+g',
    () => {
      handleSetShouldPinGallery();
    },
    [shouldPinGallery]
  );

  useHotkeys(
    'esc',
    () => {
      dispatch(setShouldShowGallery(false));
    },
    {
      enabled: () => !shouldPinGallery,
      preventDefault: true,
    },
    [shouldPinGallery]
  );

  const IMAGE_SIZE_STEP = 32;

  useHotkeys(
    'shift+up',
    () => {
      if (galleryImageMinimumWidth >= 256) {
        return;
      }
      if (galleryImageMinimumWidth < 256) {
        const newMinWidth = galleryImageMinimumWidth + IMAGE_SIZE_STEP;
        if (newMinWidth <= 256) {
          dispatch(setGalleryImageMinimumWidth(newMinWidth));
          toast({
            title: `Gallery Thumbnail Size set to ${newMinWidth}`,
            status: 'success',
            duration: 1000,
            isClosable: true,
          });
        } else {
          dispatch(setGalleryImageMinimumWidth(256));
          toast({
            title: `Gallery Thumbnail Size set to 256`,
            status: 'success',
            duration: 1000,
            isClosable: true,
          });
        }
      }
    },
    [galleryImageMinimumWidth]
  );

  useHotkeys(
    'shift+down',
    () => {
      if (galleryImageMinimumWidth <= 32) {
        return;
      }
      if (galleryImageMinimumWidth > 32) {
        const newMinWidth = galleryImageMinimumWidth - IMAGE_SIZE_STEP;
        if (newMinWidth > 32) {
          dispatch(setGalleryImageMinimumWidth(newMinWidth));
          toast({
            title: `Gallery Thumbnail Size set to ${newMinWidth}`,
            status: 'success',
            duration: 1000,
            isClosable: true,
          });
        } else {
          dispatch(setGalleryImageMinimumWidth(32));
          toast({
            title: `Gallery Thumbnail Size set to 32`,
            status: 'success',
            duration: 1000,
            isClosable: true,
          });
        }
      }
    },
    [galleryImageMinimumWidth]
  );

  // set gallery scroll position
  useEffect(() => {
    if (!galleryContainerRef.current) return;
    galleryContainerRef.current.scrollTop = galleryScrollPosition;
  }, [galleryScrollPosition, shouldShowGallery]);

  useEffect(() => {
    setShouldShowButtons(galleryWidth >= 280);
  }, [galleryWidth]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        !shouldPinGallery &&
        galleryRef.current &&
        !galleryRef.current.contains(e.target as Node)
      ) {
        handleCloseGallery();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleCloseGallery, shouldPinGallery]);

  return (
    <CSSTransition
      nodeRef={galleryRef}
      in={shouldShowGallery || shouldHoldGalleryOpen}
      unmountOnExit
      timeout={200}
      classNames="image-gallery-wrapper"
    >
      <div
        className="image-gallery-wrapper"
        style={{ zIndex: shouldPinGallery ? 1 : 100 }}
        data-pinned={shouldPinGallery}
        ref={galleryRef}
        onMouseLeave={!shouldPinGallery ? setCloseGalleryTimer : undefined}
        onMouseEnter={!shouldPinGallery ? cancelCloseGalleryTimer : undefined}
        onMouseOver={!shouldPinGallery ? cancelCloseGalleryTimer : undefined}
      >
        <Resizable
          minWidth={galleryMinWidth}
          maxWidth={galleryMaxWidth}
          className={'image-gallery-popup'}
          handleStyles={{ left: { width: '15px' } }}
          enable={{ left: true }}
          size={{
            width: galleryWidth,
            height: shouldPinGallery ? '100%' : '100vh',
          }}
          onResizeStop={(
            _event: MouseEvent | TouchEvent,
            _direction: Direction,
            elementRef: HTMLElement,
            delta: NumberSize
          ) => {
            dispatch(
              setGalleryWidth(
                _.clamp(
                  Number(galleryWidth) + delta.width,
                  0,
                  Number(galleryMaxWidth)
                )
              )
            );
            elementRef.removeAttribute('data-resize-alert');
          }}
          onResize={(
            _event: MouseEvent | TouchEvent,
            _direction: Direction,
            elementRef: HTMLElement,
            delta: NumberSize
          ) => {
            const newWidth = _.clamp(
              Number(galleryWidth) + delta.width,
              0,
              Number(galleryMaxWidth)
            );

            if (newWidth >= 315 && !shouldShowButtons) {
              setShouldShowButtons(true);
            } else if (newWidth < 315 && shouldShowButtons) {
              setShouldShowButtons(false);
            }

            if (newWidth >= galleryMaxWidth) {
              elementRef.setAttribute('data-resize-alert', 'true');
            } else {
              elementRef.removeAttribute('data-resize-alert');
            }
          }}
        >
          <div className="image-gallery-header">
            <ButtonGroup
              size="sm"
              isAttached
              variant="solid"
              className="image-gallery-category-btn-group"
            >
              {shouldShowButtons ? (
                <>
                  <IAIButton
                    size={'sm'}
                    data-selected={currentCategory === 'result'}
                    onClick={() => dispatch(setCurrentCategory('result'))}
                  >
                    Generations
                  </IAIButton>
                  <IAIButton
                    size={'sm'}
                    data-selected={currentCategory === 'user'}
                    onClick={() => dispatch(setCurrentCategory('user'))}
                  >
                    Uploads
                  </IAIButton>
                </>
              ) : (
                <>
                  <IAIIconButton
                    aria-label="Show Generations"
                    tooltip="Show Generations"
                    data-selected={currentCategory === 'result'}
                    icon={<FaImage />}
                    onClick={() => dispatch(setCurrentCategory('result'))}
                  />
                  <IAIIconButton
                    aria-label="Show Uploads"
                    tooltip="Show Uploads"
                    data-selected={currentCategory === 'user'}
                    icon={<FaUser />}
                    onClick={() => dispatch(setCurrentCategory('user'))}
                  />
                </>
              )}
            </ButtonGroup>

            <div className="image-gallery-header-right-icons">
              <IAIPopover
                isLazy
                trigger="hover"
                placement={'left'}
                triggerComponent={
                  <IAIIconButton
                    size={'sm'}
                    aria-label={'Gallery Settings'}
                    icon={<FaWrench />}
                    className="image-gallery-icon-btn"
                    cursor={'pointer'}
                  />
                }
              >
                <div className="image-gallery-settings-popover">
                  <div>
                    <IAISlider
                      value={galleryImageMinimumWidth}
                      onChange={handleChangeGalleryImageMinimumWidth}
                      min={32}
                      max={256}
                      hideTooltip={true}
                      label={'Image Size'}
                    />
                    <IAIIconButton
                      size={'sm'}
                      aria-label={'Reset'}
                      tooltip={'Reset Size'}
                      onClick={() => dispatch(setGalleryImageMinimumWidth(64))}
                      icon={<BiReset />}
                      data-selected={shouldPinGallery}
                      styleClass="image-gallery-icon-btn"
                    />
                  </div>
                  <div>
                    <IAICheckbox
                      label="Maintain Aspect Ratio"
                      isChecked={galleryImageObjectFit === 'contain'}
                      onChange={() =>
                        dispatch(
                          setGalleryImageObjectFit(
                            galleryImageObjectFit === 'contain'
                              ? 'cover'
                              : 'contain'
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <IAICheckbox
                      label="Auto-Switch to New Images"
                      isChecked={shouldAutoSwitchToNewImages}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        dispatch(
                          setShouldAutoSwitchToNewImages(e.target.checked)
                        )
                      }
                    />
                  </div>
                </div>
              </IAIPopover>

              <IAIIconButton
                size={'sm'}
                className={'image-gallery-icon-btn'}
                aria-label={'Pin Gallery'}
                tooltip={'Pin Gallery (Shift+G)'}
                onClick={handleSetShouldPinGallery}
                icon={shouldPinGallery ? <BsPinAngleFill /> : <BsPinAngle />}
              />
            </div>
          </div>
          <div className="image-gallery-container" ref={galleryContainerRef}>
            {images.length || areMoreImagesAvailable ? (
              <>
                <div
                  className="image-gallery"
                  style={{ gridTemplateColumns: galleryGridTemplateColumns }}
                >
                  {images.map((image) => {
                    const { uuid } = image;
                    const isSelected = currentImageUuid === uuid;
                    return (
                      <HoverableImage
                        key={uuid}
                        image={image}
                        isSelected={isSelected}
                      />
                    );
                  })}
                </div>
                <Button
                  onClick={handleClickLoadMore}
                  isDisabled={!areMoreImagesAvailable}
                  className="image-gallery-load-more-btn"
                >
                  {areMoreImagesAvailable ? 'Load More' : 'All Images Loaded'}
                </Button>
              </>
            ) : (
              <div className="image-gallery-container-placeholder">
                <MdPhotoLibrary />
                <p>No Images In Gallery</p>
              </div>
            )}
          </div>
        </Resizable>
      </div>
    </CSSTransition>
  );
}
