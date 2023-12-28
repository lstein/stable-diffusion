import { Flex, FormLabel, forwardRef } from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { stateSelector } from 'app/store/store';
import { useAppSelector } from 'app/store/storeHooks';
import IAIInformationalPopover from 'common/components/IAIInformationalPopover/IAIInformationalPopover';
import { InvControlGroupContext } from 'common/components/InvControl/InvControlGroup';
import { useContext } from 'react';

import type { InvLabelProps } from './types';

const selector = createSelector(
  stateSelector,
  ({ system }) => system.shouldEnableInformationalPopovers
);

export const InvLabel = forwardRef<InvLabelProps, typeof FormLabel>(
  (
    { feature, renderInfoPopoverInPortal, children, ...rest }: InvLabelProps,
    ref
  ) => {
    const shouldEnableInformationalPopovers = useAppSelector(selector);
    const ctx = useContext(InvControlGroupContext);
    if (feature && shouldEnableInformationalPopovers) {
      return (
        <IAIInformationalPopover
          feature={feature}
          inPortal={renderInfoPopoverInPortal}
        >
          <Flex as="span">
            <FormLabel ref={ref} {...ctx.labelProps} {...rest}>
              {children}
            </FormLabel>
          </Flex>
        </IAIInformationalPopover>
      );
    }
    return (
      <FormLabel ref={ref} {...ctx.labelProps} {...rest}>
        {children}
      </FormLabel>
    );
  }
);
