import { Flex, Select, Text } from '@invoke-ai/ui-library';
import { useAppDispatch } from 'app/store/storeHooks';
import { getOverlayScrollbarsParams, overlayScrollbarsStyles } from 'common/components/OverlayScrollbars/constants';
import { FloatGeneratorArithmeticSequenceSettings } from 'features/nodes/components/flow/nodes/Invocation/fields/inputs/FloatGeneratorArithmeticSequenceSettings';
import { FloatGeneratorLinearDistributionSettings } from 'features/nodes/components/flow/nodes/Invocation/fields/inputs/FloatGeneratorLinearDistributionSettings';
import { FloatGeneratorUniformRandomDistributionSettings } from 'features/nodes/components/flow/nodes/Invocation/fields/inputs/FloatGeneratorUniformRandomDistributionSettings';
import { fieldFloatGeneratorValueChanged } from 'features/nodes/store/nodesSlice';
import {
  FloatGeneratorArithmeticSequenceType,
  type FloatGeneratorFieldInputInstance,
  type FloatGeneratorFieldInputTemplate,
  FloatGeneratorLinearDistributionType,
  FloatGeneratorUniformRandomDistributionType,
  getFloatGeneratorArithmeticSequenceDefaults,
  getFloatGeneratorLinearDistributionDefaults,
  getFloatGeneratorUniformRandomDistributionDefaults,
  resolveFloatGeneratorField,
} from 'features/nodes/types/field';
import { round } from 'lodash-es';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { FieldComponentProps } from './types';

const overlayscrollbarsOptions = getOverlayScrollbarsParams().options;

const getDefaultValue = (generatorType: string) => {
  if (generatorType === FloatGeneratorArithmeticSequenceType) {
    return getFloatGeneratorArithmeticSequenceDefaults();
  }
  if (generatorType === FloatGeneratorLinearDistributionType) {
    return getFloatGeneratorLinearDistributionDefaults();
  }
  if (generatorType === FloatGeneratorUniformRandomDistributionType) {
    return getFloatGeneratorUniformRandomDistributionDefaults();
  }
  return null;
};

export const FloatGeneratorFieldInputComponent = memo(
  (props: FieldComponentProps<FloatGeneratorFieldInputInstance, FloatGeneratorFieldInputTemplate>) => {
    const { nodeId, field } = props;
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const onChange = useCallback(
      (value: FloatGeneratorFieldInputInstance['value']) => {
        dispatch(
          fieldFloatGeneratorValueChanged({
            nodeId,
            fieldName: field.name,
            value,
          })
        );
      },
      [dispatch, field.name, nodeId]
    );

    const onChangeGeneratorType = useCallback(
      (e: ChangeEvent<HTMLSelectElement>) => {
        const value = getDefaultValue(e.target.value);
        if (!value) {
          return;
        }
        dispatch(
          fieldFloatGeneratorValueChanged({
            nodeId,
            fieldName: field.name,
            value,
          })
        );
      },
      [dispatch, field.name, nodeId]
    );

    const resolvedValues = useMemo(() => resolveFloatGeneratorField(field), [field]);
    const resolvedValuesAsString = useMemo(() => {
      if (resolvedValues.length === 0) {
        return '<empty>';
      } else {
        return resolvedValues.map((val) => round(val, 2)).join(', ');
      }
    }, [resolvedValues]);

    return (
      <Flex flexDir="column" gap={2}>
        <Select className="nowheel nodrag" onChange={onChangeGeneratorType} value={field.value.type} size="sm">
          <option value={FloatGeneratorArithmeticSequenceType}>{t('nodes.arithmeticSequence')}</option>
          <option value={FloatGeneratorLinearDistributionType}>{t('nodes.linearDistribution')}</option>
          <option value={FloatGeneratorUniformRandomDistributionType}>{t('nodes.uniformRandomDistribution')}</option>
        </Select>
        {field.value.type === FloatGeneratorArithmeticSequenceType && (
          <FloatGeneratorArithmeticSequenceSettings state={field.value} onChange={onChange} />
        )}
        {field.value.type === FloatGeneratorLinearDistributionType && (
          <FloatGeneratorLinearDistributionSettings state={field.value} onChange={onChange} />
        )}
        {field.value.type === FloatGeneratorUniformRandomDistributionType && (
          <FloatGeneratorUniformRandomDistributionSettings state={field.value} onChange={onChange} />
        )}
        {/* We don't show previews for random generators, bc they are non-deterministic */}
        {field.value.type !== FloatGeneratorUniformRandomDistributionType && (
          <Flex w="full" h="full" p={2} borderWidth={1} borderRadius="base" maxH={128}>
            <Flex w="full" h="auto">
              <OverlayScrollbarsComponent
                className="nodrag nowheel"
                defer
                style={overlayScrollbarsStyles}
                options={overlayscrollbarsOptions}
              >
                <Text className="nodrag nowheel" fontFamily="monospace" userSelect="text" cursor="text">
                  {resolvedValuesAsString}
                </Text>
              </OverlayScrollbarsComponent>
            </Flex>
          </Flex>
        )}
      </Flex>
    );
  }
);

FloatGeneratorFieldInputComponent.displayName = 'FloatGeneratorFieldInputComponent';