import {
  ExternalLink,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@invoke-ai/ui-library';
import ScrollableContent from 'common/components/OverlayScrollbars/ScrollableContent';
import { buildUseDisclosure } from 'common/hooks/useBoolean';
import {
  controlCanvasVideos,
  gettingStartedVideos,
  studioSessionsPlaylistLink,
} from 'features/system/components/VideosModal/data';
import { VideoCardList } from 'features/system/components/VideosModal/VideoCardList';
import { discordLink } from 'features/system/store/constants';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export const [useVideosModal] = buildUseDisclosure(false);

const StudioSessionsPlaylistLink = () => {
  return (
    <ExternalLink
      fontWeight="semibold"
      href={studioSessionsPlaylistLink}
      display="inline-flex"
      label="Studio Sessions playlist"
    />
  );
};

const DiscordLink = () => {
  return <ExternalLink fontWeight="semibold" href={discordLink} display="inline-flex" label="Discord" />;
};

const components = {
  StudioSessionsPlaylistLink: <StudioSessionsPlaylistLink />,
  DiscordLink: <DiscordLink />,
};

export const VideosModal = memo(() => {
  const { t } = useTranslation();
  const videosModal = useVideosModal();

  return (
    <Modal isOpen={videosModal.isOpen} onClose={videosModal.close} size="2xl" isCentered useInert={false}>
      <ModalOverlay />
      <ModalContent maxH="80vh" h="80vh">
        <ModalHeader bg="none">{t('supportVideos.supportVideos')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <ScrollableContent>
            <Flex flexDir="column" gap={4}>
              <Flex flexDir="column" gap={2} pb={2}>
                <Text fontSize="md">
                  <Trans i18nKey="supportVideos.studioSessionsDesc1" components={components} />
                </Text>
                <Text fontSize="md">
                  <Trans i18nKey="supportVideos.studioSessionsDesc2" components={components} />
                </Text>
              </Flex>
              <VideoCardList category={t('supportVideos.gettingStarted')} videos={gettingStartedVideos} />
              <VideoCardList category={t('supportVideos.controlCanvas')} videos={controlCanvasVideos} />
            </Flex>
          </ScrollableContent>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
});

VideosModal.displayName = 'VideosModal';
