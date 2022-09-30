import React, { ChangeEvent } from 'react';
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../app/store';
import SDSwitch from '../../../../common/components/SDSwitch';
import { setShouldGenerateVariations } from '../../optionsSlice';

export default function GenerateVariations() {
  const shouldGenerateVariations = useAppSelector(
    (state: RootState) => state.options.shouldGenerateVariations
  );

  const dispatch = useAppDispatch();

  const handleChangeShouldGenerateVariations = (
    e: ChangeEvent<HTMLInputElement>
  ) => dispatch(setShouldGenerateVariations(e.target.checked));

  return (
    <SDSwitch
      isChecked={shouldGenerateVariations}
      width={'auto'}
      onChange={handleChangeShouldGenerateVariations}
    />
  );
}
