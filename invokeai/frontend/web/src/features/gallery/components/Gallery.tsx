import type { ChakraProps } from '@invoke-ai/ui-library';
import { Box, Collapse, Flex, IconButton, Tab, TabList, Tabs, Text, useDisclosure } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { galleryViewChanged, searchTermChanged } from 'features/gallery/store/gallerySlice';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSearch, MdSearchOff } from 'react-icons/md';
import { useBoardName } from 'services/api/hooks/useBoardName';

import { COLLAPSE_STYLES } from './ImageGalleryContent';
import GalleryImageGrid from './ImageGrid/GalleryImageGrid';
import { GalleryPagination } from './ImageGrid/GalleryPagination';
import { GallerySearch } from './ImageGrid/GallerySearch';

const BASE_STYLES: ChakraProps['sx'] = {
  fontWeight: 'semibold',
  fontSize: 'sm',
  color: 'base.300',
};

const SELECTED_STYLES: ChakraProps['sx'] = {
  borderColor: 'base.800',
  borderBottomColor: 'base.900',
  color: 'invokeBlue.300',
};

export const Gallery = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const galleryView = useAppSelector((s) => s.gallery.galleryView);
  const searchTerm = useAppSelector((s) => s.gallery.searchTerm);
  const searchDisclosure = useDisclosure({ defaultIsOpen: !!searchTerm.length });

  const handleClickImages = useCallback(() => {
    dispatch(galleryViewChanged('images'));
  }, [dispatch]);

  const handleClickAssets = useCallback(() => {
    dispatch(galleryViewChanged('assets'));
  }, [dispatch]);

  const handleClickSearch = useCallback(() => {
    if (searchTerm.length) {
      dispatch(searchTermChanged(''));
      searchDisclosure.onToggle();
    } else {
      searchDisclosure.onToggle();
    }
  }, [searchTerm, dispatch, searchDisclosure]);

  const selectedBoardId = useAppSelector((s) => s.gallery.selectedBoardId);
  const boardName = useBoardName(selectedBoardId);

  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="space-between" h="full" w="full">
      <Flex alignItems="center" justifyContent="space-between" w="full">
        <Text fontSize="sm" fontWeight="semibold" noOfLines={1} px="2">
          {boardName}
        </Text>
        <Flex alignItems="center" justifyContent="space-between">
          <Tabs index={galleryView === 'images' ? 0 : 1} variant="enclosed" display="flex" flexDir="column">
            <TabList gap={2} fontSize="sm" borderColor="base.800">
              <Tab sx={BASE_STYLES} _selected={SELECTED_STYLES} onClick={handleClickImages} data-testid="images-tab">
                {t('parameters.images')}
              </Tab>
              <Tab sx={BASE_STYLES} _selected={SELECTED_STYLES} onClick={handleClickAssets} data-testid="assets-tab">
                {t('gallery.assets')}
              </Tab>
            </TabList>
          </Tabs>
          <Box position="relative">
            <IconButton
              w="full"
              h="full"
              onClick={handleClickSearch}
              tooltip={searchDisclosure.isOpen ? `${t('gallery.exitSearch')}` : `${t('gallery.displaySearch')}`}
              aria-label={t('gallery.displaySearch')}
              icon={searchTerm.length ? <MdSearchOff /> : <MdSearch />}
              variant="link"
            />
          </Box>
        </Flex>
      </Flex>

      <Box w="full">
        <Collapse in={searchDisclosure.isOpen} style={COLLAPSE_STYLES}>
          <Box w="full" pt={2}>
            <GallerySearch />
          </Box>
        </Collapse>
      </Box>
      <GalleryImageGrid />
      <GalleryPagination />
    </Flex>
  );
};
