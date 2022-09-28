import {
  Flex,
  Box,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Switch,
  ExpandedIndex,
} from '@chakra-ui/react';

import { RootState } from '../../app/store';
import { useAppDispatch, useAppSelector } from '../../app/store';

import {
  setShouldRunGFPGAN,
  setShouldRunESRGAN,
  OptionsState,
  setShouldUseInitImage,
} from './optionsSlice';
import { createSelector } from '@reduxjs/toolkit';
import { isEqual } from 'lodash';
import { setOpenAccordions, SystemState } from '../system/systemSlice';
import ESRGANOptions from './ESRGANOptions';
import GFPGANOptions from './GFPGANOptions';
import OutputOptions from './OutputOptions';
import ImageToImageOptions from './ImageToImageOptions';
import { ChangeEvent } from 'react';

import GuideIcon from '../../common/components/GuideIcon';
import { Feature } from '../../app/features';
import SeedOptions from './SeedOptions';
import VariationsOptions from './VariationsOptions';

/**
 * Main container for generation and processing parameters.
 */
const OptionsAccordion = () => {
  const {
    shouldRunESRGAN,
    shouldRunGFPGAN,
    shouldUseInitImage,
    initialImagePath,
  } = useAppSelector((state: RootState) => state.options);

  const { isGFPGANAvailable, isESRGANAvailable, openAccordions } =
    useAppSelector((state: RootState) => state.system);

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
              Seed
            </Box>
            <GuideIcon feature={Feature.SEED} />
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          <SeedOptions />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Variations
            </Box>
            <GuideIcon feature={Feature.VARIATIONS} />
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          <VariationsOptions />
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
              <Text>Upscale</Text>
              <Switch
                isDisabled={!isESRGANAvailable}
                isChecked={shouldRunESRGAN}
                onChange={handleChangeShouldRunESRGAN}
              />
            </Flex>
            <GuideIcon feature={Feature.ESRGAN} />
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
              <Text>Restore Face</Text>
              <Switch
                isDisabled={!isGFPGANAvailable}
                isChecked={shouldRunGFPGAN}
                onChange={handleChangeShouldRunGFPGAN}
              />
            </Flex>
            <GuideIcon feature={Feature.FACE_CORRECTION} />
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
            <GuideIcon feature={Feature.IMAGE_TO_IMAGE} />
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
              Other
            </Box>
            <GuideIcon feature={Feature.OTHER} />
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
