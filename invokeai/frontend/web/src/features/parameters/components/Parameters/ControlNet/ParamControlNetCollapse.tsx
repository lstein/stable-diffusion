import { ButtonGroup, Divider, Flex } from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { stateSelector } from 'app/store/store';
import { useAppSelector } from 'app/store/storeHooks';
import { defaultSelectorOptions } from 'app/store/util/defaultMemoizeOptions';
import IAIButton from 'common/components/IAIButton';
import IAICollapse from 'common/components/IAICollapse';
import ControlNet from 'features/controlNet/components/ControlNet';
import { useAddControlNet } from 'features/controlNet/hooks/useAddControlNet';
import { useAddIPAdapter } from 'features/controlNet/hooks/useAddIPAdapter';
import { useAddT2IAdapter } from 'features/controlNet/hooks/useAddT2IAdapter';
import {
  selectAllControlNets,
  selectAllIPAdapters,
  selectAllT2IAdapters,
} from 'features/controlNet/store/controlAdaptersSlice';
import { useFeatureStatus } from 'features/system/hooks/useFeatureStatus';
import { Fragment, memo } from 'react';
import { FaPlus } from 'react-icons/fa';

const selector = createSelector(
  [stateSelector],
  ({ controlAdapters }) => {
    const activeLabel: string[] = [];

    const ipAdapters = selectAllIPAdapters(controlAdapters);
    const ipAdapterCount = ipAdapters.length;
    if (ipAdapterCount > 0) {
      activeLabel.push(`${ipAdapterCount} IP`);
    }

    const controlNets = selectAllControlNets(controlAdapters);
    const controlNetCount = controlNets.length;
    if (controlNetCount > 0) {
      activeLabel.push(`${controlNetCount} ControlNet`);
    }

    const t2iAdapters = selectAllT2IAdapters(controlAdapters);
    const t2iAdapterCount = t2iAdapters.length;
    if (t2iAdapterCount > 0) {
      activeLabel.push(`${t2iAdapterCount} T2I`);
    }

    const controlAdapterIds = [ipAdapters, controlNets, t2iAdapters]
      .flat()
      .map((ca) => ca.id);

    return {
      controlAdapterIds,
      activeLabel: activeLabel.join(', '),
    };
  },
  defaultSelectorOptions
);

const ParamControlNetCollapse = () => {
  const { controlAdapterIds, activeLabel } = useAppSelector(selector);
  const isControlNetDisabled = useFeatureStatus('controlNet').isFeatureDisabled;
  const { addControlNet } = useAddControlNet();
  const { addIPAdapter } = useAddIPAdapter();
  const { addT2IAdapter } = useAddT2IAdapter();

  if (isControlNetDisabled) {
    return null;
  }

  return (
    <IAICollapse label="Control Adapters" activeLabel={activeLabel}>
      <Flex sx={{ flexDir: 'column', gap: 2 }}>
        <ButtonGroup size="sm" w="full" justifyContent="space-between">
          <IAIButton
            leftIcon={<FaPlus />}
            onClick={addControlNet}
            data-testid="add controlnet"
          >
            ControlNet
          </IAIButton>
          <IAIButton
            leftIcon={<FaPlus />}
            onClick={addIPAdapter}
            data-testid="add ip adapter"
          >
            IP Adapter
          </IAIButton>
          <IAIButton
            leftIcon={<FaPlus />}
            onClick={addT2IAdapter}
            data-testid="add t2i adapter"
          >
            T2I Adapter
          </IAIButton>
        </ButtonGroup>
        {controlAdapterIds.map((id, i) => (
          <Fragment key={id}>
            {i > 0 && <Divider />}
            <ControlNet id={id} />
          </Fragment>
        ))}
      </Flex>
    </IAICollapse>
  );
};

export default memo(ParamControlNetCollapse);
