import { Flex } from '@chakra-ui/react';

import { RootState } from '../../../../app/store';
import { useAppDispatch, useAppSelector } from '../../../../app/store';

import { OptionsState, setGfpganStrength } from '../../optionsSlice';

import { createSelector } from '@reduxjs/toolkit';
import { isEqual } from 'lodash';
import { SystemState } from '../../../system/systemSlice';
import SDNumberInput from '../../../../common/components/SDNumberInput';

const optionsSelector = createSelector(
  (state: RootState) => state.options,
  (options: OptionsState) => {
    return {
      gfpganStrength: options.gfpganStrength,
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
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  }
);

/**
 * Displays face-fixing/GFPGAN options (strength).
 */
const FaceRestoreOptions = () => {
  const dispatch = useAppDispatch();
  const { gfpganStrength } = useAppSelector(optionsSelector);
  const { isGFPGANAvailable } = useAppSelector(systemSelector);
  const shouldRunGFPGAN = useAppSelector(
    (state: RootState) => state.options.shouldRunGFPGAN
  );

  const handleChangeStrength = (v: number) => dispatch(setGfpganStrength(v));

  return (
    <Flex direction={'column'} gap={2}>
      <SDNumberInput
        isDisabled={!isGFPGANAvailable || !shouldRunGFPGAN}
        label="Strength"
        step={0.05}
        min={0}
        max={1}
        onChange={handleChangeStrength}
        value={gfpganStrength}
        width="90px"
        isInteger={false}
      />
    </Flex>
  );
};

export default FaceRestoreOptions;
