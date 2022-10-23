import { Box } from '@chakra-ui/react';
import React from 'react';
import { Resizable } from 're-resizable';
import { Feature } from '../../../app/features';
import { RootState, useAppSelector } from '../../../app/store';
import FaceRestore from '../../options/AdvancedOptions/FaceRestore/FaceRestore';
import FaceRestoreOptions from '../../options/AdvancedOptions/FaceRestore/FaceRestoreOptions';
import ImageToImageAccordion from '../../options/AdvancedOptions/ImageToImage/ImageToImageAccordion';
import ImageToImageOptions from '../../options/AdvancedOptions/ImageToImage/ImageToImageOptions';
import SeedOptions from '../../options/AdvancedOptions/Seed/SeedOptions';
import Upscale from '../../options/AdvancedOptions/Upscale/Upscale';
import UpscaleOptions from '../../options/AdvancedOptions/Upscale/UpscaleOptions';
import Variations from '../../options/AdvancedOptions/Variations/Variations';
import VariationsOptions from '../../options/AdvancedOptions/Variations/VariationsOptions';
import MainAdvancedOptions from '../../options/MainOptions/MainAdvancedOptions';
import MainOptions from '../../options/MainOptions/MainOptions';
import OptionsAccordion from '../../options/OptionsAccordion';
import OutputOptions from '../../options/OutputOptions';
import ProcessButtons from '../../options/ProcessButtons/ProcessButtons';
import PromptInput from '../../options/PromptInput/PromptInput';

export default function TextToImagePanel() {
  const showAdvancedOptions = useAppSelector(
    (state: RootState) => state.options.showAdvancedOptions
  );

  const handleResize = (event: MouseEvent | TouchEvent | any, direction, elementRef: HTMLElement) => {
    const upscaleOptions = elementRef.querySelector('.upscale-options');
    upscaleOptions.style.gridTemplateColumns = (upscaleOptions.clientWidth >= 318) ? 'auto 1fr' : '1fr';
  };

  const textToImageAccordions = {
    seed: {
      header: (
        <Box flex="1" textAlign="left">
          Seed
        </Box>
      ),
      feature: Feature.SEED,
      options: <SeedOptions />,
    },
    variations: {
      header: <Variations />,
      feature: Feature.VARIATIONS,
      options: <VariationsOptions />,
    },
    face_restore: {
      header: <FaceRestore />,
      feature: Feature.FACE_CORRECTION,
      options: <FaceRestoreOptions />,
    },
    upscale: {
      header: <Upscale />,
      feature: Feature.UPSCALE,
      options: <UpscaleOptions />,
    },
    // img2img: {
    //   header: <ImageToImageAccordion />,
    //   feature: Feature.IMAGE_TO_IMAGE,
    //   options: <ImageToImageOptions />,
    // },
    other: {
      header: (
        <Box flex="1" textAlign="left">
          Other
        </Box>
      ),
      // feature: Feature.OTHER,
      options: <OutputOptions />,
    },
  };

  return (
    <Resizable
      enable={{ right: true }}
      defaultSize={{ width: '370', height: '100%' }}
      minWidth={'370'}
      maxWidth={'800'}
      onResize={handleResize}
    >
      <div className="text-to-image-panel">
        <PromptInput />
        <ProcessButtons />
        <MainOptions />
        <MainAdvancedOptions />
        {showAdvancedOptions ? (
          <OptionsAccordion accordionInfo={textToImageAccordions} />
        ) : null}
      </div>
    </Resizable>
  );
}
