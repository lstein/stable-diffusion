import { Badge } from '@invoke-ai/ui-library';
import { memo } from 'react';
import type { AnyModelConfig } from 'services/api/types';

type Props = {
  format: AnyModelConfig['format'];
};

const FORMAT_NAME_MAP: Record<AnyModelConfig['format'], string> = {
  diffusers: 'diffusers',
  lycoris: 'lycoris',
  checkpoint: 'checkpoint',
  invokeai: 'internal',
  embedding_file: 'embedding',
  embedding_folder: 'embedding',
  t5_encoder: 't5_encoder',
  t5_encoder_8b: 't5_encoder_8b',
  bnb_quantized_nf4b: 'quantized',
};

const FORMAT_COLOR_MAP: Record<AnyModelConfig['format'], string> = {
  diffusers: 'base',
  lycoris: 'base',
  checkpoint: 'orange',
  invokeai: 'base',
  embedding_file: 'base',
  embedding_folder: 'base',
  t5_encoder: 'base',
  t5_encoder_8b: 'base',
  bnb_quantized_nf4b: 'base',
};

const ModelFormatBadge = ({ format }: Props) => {
  return (
    <Badge flexGrow={0} colorScheme={FORMAT_COLOR_MAP[format]} variant="subtle">
      {FORMAT_NAME_MAP[format]}
    </Badge>
  );
};

export default memo(ModelFormatBadge);
