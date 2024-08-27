import { MenuItem } from '@invoke-ai/ui-library';
import { useAppDispatch } from 'app/store/storeHooks';
import { useEntityIdentifierContext } from 'features/controlLayers/contexts/EntityIdentifierContext';
import { entityDeleted } from 'features/controlLayers/store/canvasSlice';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PiTrashSimpleBold } from 'react-icons/pi';

export const CanvasEntityMenuItemsDelete = memo(() => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const entityIdentifier = useEntityIdentifierContext();

  const deleteEntity = useCallback(() => {
    dispatch(entityDeleted({ entityIdentifier }));
  }, [dispatch, entityIdentifier]);

  return (
    <MenuItem onClick={deleteEntity} icon={<PiTrashSimpleBold />} color="error.300">
      {t('common.delete')}
    </MenuItem>
  );
});

CanvasEntityMenuItemsDelete.displayName = 'CanvasEntityMenuItemsDelete';
