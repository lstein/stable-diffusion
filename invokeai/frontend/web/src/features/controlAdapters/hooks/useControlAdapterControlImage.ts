import { createSelector } from '@reduxjs/toolkit';
import { stateSelector } from 'app/store/store';
import { useMemo } from 'react';
import { selectControlAdapterById } from '../store/controlAdaptersSlice';
import { useAppSelector } from 'app/store/storeHooks';
import { defaultSelectorOptions } from 'app/store/util/defaultMemoizeOptions';

export const useControlAdapterControlImage = (id: string) => {
  const selector = useMemo(
    () =>
      createSelector(
        stateSelector,
        ({ controlAdapters }) =>
          selectControlAdapterById(controlAdapters, id)?.controlImage,
        defaultSelectorOptions
      ),
    [id]
  );

  const weight = useAppSelector(selector);

  return weight;
};
