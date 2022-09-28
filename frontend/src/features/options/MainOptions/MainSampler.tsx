import React, { ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { SAMPLERS } from '../../../app/constants';
import { RootState, useAppSelector } from '../../../app/store';
import SDSelect from '../../../common/components/SDSelect';
import { setSampler } from '../optionsSlice';
import { fontSize } from './MainOptions';

export default function MainSampler() {
  const sampler = useAppSelector((state: RootState) => state.options.sampler);
  const dispatch = useDispatch();

  const handleChangeSampler = (e: ChangeEvent<HTMLSelectElement>) =>
    dispatch(setSampler(e.target.value));

  return (
    <SDSelect
      label="Sampler"
      value={sampler}
      onChange={handleChangeSampler}
      validValues={SAMPLERS}
      fontSize={fontSize}
      styleClass="main-option-block"
    />
  );
}
