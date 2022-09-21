import {
  Flex,
  Box,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  Icon,
  AccordionPanel,
  Switch,
  ExpandedIndex,
} from '@chakra-ui/react';
import { MdHelp } from 'react-icons/md';

import { RootState } from '../../app/store';
import { useAppDispatch, useAppSelector } from '../../app/store';

import {
  setShouldRunGFPGAN,
  setShouldRunESRGAN,
  SDState,
  setShouldUseInitImage,
} from '../sd/sdSlice';
import { createSelector } from '@reduxjs/toolkit';
import { isEqual } from 'lodash';
import { setOpenAccordions, SystemState } from '../system/systemSlice';
import SeedVariationOptions from './SeedVariationOptions';
import SamplerOptions from './SamplerOptions';
import ESRGANOptions from './ESRGANOptions';
import GFPGANOptions from './GFPGANOptions';
import OutputOptions from './OutputOptions';
import ImageToImageOptions from './ImageToImageOptions';
import { ChangeEvent } from 'react';
import GuidePopover from '../../common/components/GuidePopover';

const sdSelector = createSelector(
  (state: RootState) => state.sd,
  (sd: SDState) => {
    return {
      initialImagePath: sd.initialImagePath,
      shouldUseInitImage: sd.shouldUseInitImage,
      shouldRunESRGAN: sd.shouldRunESRGAN,
      shouldRunGFPGAN: sd.shouldRunGFPGAN,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  }
);

const systemSelector = createSelector(
  (state: RootState) => state.system,
  (system: SystemState) => {
    return {
      isGFPGANAvailable: system.isGFPGANAvailable,
      isESRGANAvailable: system.isESRGANAvailable,
      openAccordions: system.openAccordions,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  }
);

/**
 * Main container for generation and processing parameters.
 */
const OptionsAccordion = () => {
  const {
    shouldRunESRGAN,
    shouldRunGFPGAN,
    shouldUseInitImage,
    initialImagePath,
  } = useAppSelector(sdSelector);

  const { isGFPGANAvailable, isESRGANAvailable, openAccordions } =
    useAppSelector(systemSelector);

  const dispatch = useAppDispatch();

  /**
   * Stores accordion state in redux so preferred UI setup is retained.
   */
  const handleChangeAccordionState = (openAccordions: ExpandedIndex) =>
    dispatch(setOpenAccordions(openAccordions));

  const handleChangeShouldRunESRGAN = (e: ChangeEvent<HTMLInputElement>) =>
    dispatch(setShouldRunESRGAN(e.target.checked));

  const handleChangeShouldRunGFPGAN = (e: ChangeEvent<HTMLInputElement>) =>
    dispatch(setShouldRunGFPGAN(e.target.checked));

  const handleChangeShouldUseInitImage = (e: ChangeEvent<HTMLInputElement>) =>
    dispatch(setShouldUseInitImage(e.target.checked));

  return (
    <Accordion
      defaultIndex={openAccordions}
      allowMultiple
      reduceMotion
      onChange={handleChangeAccordionState}
    >
      <AccordionItem>
        <h2>
        
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Seed & Variation
            </Box>
            <GuidePopover feature={"SeedAndVariation"}>
              <Icon as={MdHelp} />
            </GuidePopover>
            <AccordionIcon />
          </AccordionButton>

        </h2>
        <AccordionPanel>
          <SeedVariationOptions />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Sampler
            </Box>
            <GuidePopover feature={"Sampler"}>
              <Icon as={MdHelp} />
            </GuidePopover>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          <SamplerOptions />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Flex
              justifyContent={'space-between'}
              alignItems={'center'}
              width={'100%'}
              mr={2}
            >
              <Text>Upscale (ESRGAN)</Text>
              
              <Switch
                isDisabled={!isESRGANAvailable}
                isChecked={shouldRunESRGAN}
                onChange={handleChangeShouldRunESRGAN}
              />
            </Flex>
            <GuidePopover feature={"ESRGAN"}>
              <Icon as={MdHelp} />
            </GuidePopover>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          <ESRGANOptions />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Flex
              justifyContent={'space-between'}
              alignItems={'center'}
              width={'100%'}
              mr={2}
            >
              <Text>Face Correction</Text>
              <Switch
                isDisabled={!isGFPGANAvailable}
                isChecked={shouldRunGFPGAN}
                onChange={handleChangeShouldRunGFPGAN}
              />
            </Flex>
            <GuidePopover feature={"FaceCorrection"}>
              <Icon as={MdHelp} />
            </GuidePopover>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          <GFPGANOptions />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Flex
              justifyContent={'space-between'}
              alignItems={'center'}
              width={'100%'}
              mr={2}
            >
              <Text>Image to Image</Text>
              <Switch
                isDisabled={!initialImagePath}
                isChecked={shouldUseInitImage}
                onChange={handleChangeShouldUseInitImage}
              />
            </Flex>
            <GuidePopover feature={"ImageToImage"}>
              <Icon as={MdHelp} />
            </GuidePopover>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          <ImageToImageOptions />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Output
            </Box>
            <GuidePopover feature={"Output"}>
              <Icon as={MdHelp} />
            </GuidePopover>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          <OutputOptions />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default OptionsAccordion;
