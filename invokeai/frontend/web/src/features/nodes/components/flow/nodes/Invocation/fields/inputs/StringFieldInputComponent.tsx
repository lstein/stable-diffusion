import { useAppDispatch } from 'app/store/storeHooks';
import { InvInput } from 'common/components/InvInput/InvInput';
import { InvTextarea } from 'common/components/InvTextarea/InvTextarea';
import { fieldStringValueChanged } from 'features/nodes/store/nodesSlice';
import type {
  StringFieldInputInstance,
  StringFieldInputTemplate,
} from 'features/nodes/types/field';
import type { ChangeEvent } from 'react';
import { memo, useCallback } from 'react';

import type { FieldComponentProps } from './types';

const StringFieldInputComponent = (
  props: FieldComponentProps<StringFieldInputInstance, StringFieldInputTemplate>
) => {
  const { nodeId, field, fieldTemplate } = props;
  const dispatch = useAppDispatch();

  const handleValueChanged = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch(
        fieldStringValueChanged({
          nodeId,
          fieldName: field.name,
          value: e.target.value,
        })
      );
    },
    [dispatch, field.name, nodeId]
  );

  if (fieldTemplate.ui_component === 'textarea') {
    return (
      <InvTextarea
        className="nodrag"
        onChange={handleValueChanged}
        value={field.value}
        rows={5}
        resize="none"
      />
    );
  }

  return (
    <InvInput
      className="nodrag"
      onChange={handleValueChanged}
      value={field.value}
    />
  );
};

export default memo(StringFieldInputComponent);
