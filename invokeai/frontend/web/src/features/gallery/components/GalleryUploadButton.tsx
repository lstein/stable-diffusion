import { IconButton } from '@invoke-ai/ui-library';
import { useImageUploadButton } from 'common/hooks/useImageUploadButton';
import { t } from 'i18next';
import { PiUploadBold } from 'react-icons/pi';

const options = { postUploadAction: { type: 'TOAST' }, allowMultiple: true } as const;

export const GalleryUploadButton = () => {
  const uploadApi = useImageUploadButton(options);
  return (
    <>
      <IconButton
        size="sm"
        alignSelf="stretch"
        variant="link"
        aria-label={t('accessibility.uploadImages')}
        tooltip={t('accessibility.uploadImages')}
        icon={<PiUploadBold />}
        {...uploadApi.getUploadButtonProps()}
      />
      <input {...uploadApi.getUploadInputProps()} />
    </>
  );
};
