import { Box } from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { stateSelector } from 'app/store/store';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { defaultSelectorOptions } from 'app/store/util/defaultMemoizeOptions';
import IAIInformationalPopover from 'common/components/IAIInformationalPopover';
import IAISwitch from 'common/components/IAISwitch';
import { isControlNetEnabledToggled } from 'features/controlNet/store/controlNetSlice';
import { memo, useCallback } from 'react';

const selector = createSelector(
  stateSelector,
  (state) => {
    const { isEnabled } = state.controlNet;

    return { isEnabled };
  },
  defaultSelectorOptions
);

const ParamControlNetFeatureToggle = () => {
  const { isEnabled } = useAppSelector(selector);
  const dispatch = useAppDispatch();

  const handleChange = useCallback(() => {
    dispatch(isControlNetEnabledToggled());
  }, [dispatch]);

  return (
    <Box width="100%">
      <IAIInformationalPopover
        details="controlNetToggle"
        buttonLabel="Learn More"
        buttonHref="https://support.invoke.ai/a/solutions/articles/151000105880?portalId=151000075831"
      >
        <IAISwitch
          label="Enable ControlNet"
          isChecked={isEnabled}
          onChange={handleChange}
        />
      </IAIInformationalPopover>
    </Box>
  );
};

export default memo(ParamControlNetFeatureToggle);
