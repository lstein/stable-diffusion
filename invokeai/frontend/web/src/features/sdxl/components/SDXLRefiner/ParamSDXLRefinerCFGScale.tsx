import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { InvControl } from 'common/components/InvControl/InvControl';
import { InvSlider } from 'common/components/InvSlider/InvSlider';
import { setRefinerCFGScale } from 'features/sdxl/store/sdxlSlice';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const ParamSDXLRefinerCFGScale = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const refinerCFGScale = useAppSelector((s) => s.sdxl.refinerCFGScale);
  const min = useAppSelector((s) => s.config.sd.guidance.min);
  const inputMax = useAppSelector((s) => s.config.sd.guidance.inputMax);
  const sliderMax = useAppSelector((s) => s.config.sd.guidance.sliderMax);
  const coarseStep = useAppSelector((s) => s.config.sd.guidance.coarseStep);
  const fineStep = useAppSelector((s) => s.config.sd.guidance.fineStep);
  const initial = useAppSelector((s) => s.config.sd.guidance.initial);
  const marks = useMemo(
    () => [min, Math.floor(sliderMax / 2), sliderMax],
    [sliderMax, min]
  );

  const onChange = useCallback(
    (v: number) => dispatch(setRefinerCFGScale(v)),
    [dispatch]
  );

  return (
    <InvControl label={t('sdxl.cfgScale')}>
      <InvSlider
        value={refinerCFGScale}
        defaultValue={initial}
        min={min}
        max={sliderMax}
        step={coarseStep}
        fineStep={fineStep}
        onChange={onChange}
        withNumberInput
        numberInputMax={inputMax}
        marks={marks}
      />
    </InvControl>
  );
};

export default memo(ParamSDXLRefinerCFGScale);
