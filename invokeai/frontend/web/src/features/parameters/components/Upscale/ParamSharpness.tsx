import { CompositeNumberInput, CompositeSlider, FormControl, FormLabel } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { sharpnessChanged } from 'features/parameters/store/upscaleSlice';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const ParamSharpness = () => {
  const sharpness = useAppSelector((s) => s.upscale.sharpness);
  const initial = 0;
  const sliderMin = -10;
  const sliderMax = 10;
  const numberInputMin = -10;
  const numberInputMax = 10;
  const coarseStep = 1;
  const fineStep = 1;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const marks = useMemo(() => [sliderMin, 0, sliderMax], [sliderMax, sliderMin]);
  const onChange = useCallback(
    (v: number) => {
      dispatch(sharpnessChanged(v));
    },
    [dispatch]
  );

  return (
    <FormControl>
      <FormLabel>{t('upscaling.sharpness')}</FormLabel>
      <CompositeSlider
        value={sharpness}
        defaultValue={initial}
        min={sliderMin}
        max={sliderMax}
        step={coarseStep}
        fineStep={fineStep}
        onChange={onChange}
        marks={marks}
      />
      <CompositeNumberInput
        value={sharpness}
        defaultValue={initial}
        min={numberInputMin}
        max={numberInputMax}
        step={coarseStep}
        fineStep={fineStep}
        onChange={onChange}
      />
    </FormControl>
  );
};

export default memo(ParamSharpness);
