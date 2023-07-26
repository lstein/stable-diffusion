import { Flex, MenuGroup, Spacer } from '@chakra-ui/react';
import { memo } from 'react';
import StatusIndicator from './StatusIndicator';

import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import IAIIconButton from 'common/components/IAIIconButton';
import { useTranslation } from 'react-i18next';
import { FaBars, FaBug, FaDiscord, FaGithub, FaKeyboard } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';
import { useFeatureStatus } from '../hooks/useFeatureStatus';
import HotkeysModal from './HotkeysModal/HotkeysModal';
import InvokeAILogoComponent from './InvokeAILogoComponent';
import SettingsModal from './SettingsModal/SettingsModal';

const SiteHeader = () => {
  const { t } = useTranslation();

  const isBugLinkEnabled = useFeatureStatus('bugLink').isFeatureEnabled;
  const isDiscordLinkEnabled = useFeatureStatus('discordLink').isFeatureEnabled;
  const isGithubLinkEnabled = useFeatureStatus('githubLink').isFeatureEnabled;

  const githubLink = 'http://github.com/invoke-ai/InvokeAI';
  const discordLink = 'https://discord.gg/ZmtBAhwWhy';

  return (
    <Flex
      sx={{
        gap: 2,
        alignItems: 'center',
      }}
    >
      <InvokeAILogoComponent />
      <Spacer />
      <StatusIndicator />

      <Menu>
        <MenuButton
          as={IAIIconButton}
          variant="link"
          aria-label={t('accessibility.menu')}
          tooltip={t('accessibility.menu')}
          icon={<FaBars />}
        />
        <MenuList>
          <MenuGroup title={t('common.communityLabel')}>
            {isGithubLinkEnabled && (
              <MenuItem
                as="a"
                href={githubLink}
                icon={<FaGithub fontSize={20} />}
              >
                {t('common.githubLabel')}
              </MenuItem>
            )}
            {isBugLinkEnabled && (
              <MenuItem
                as="a"
                href={`${githubLink}/issues}`}
                icon={<FaBug fontSize={20} />}
              >
                {t('common.reportBugLabel')}
              </MenuItem>
            )}
            {isDiscordLinkEnabled && (
              <MenuItem
                as="a"
                href={discordLink}
                icon={<FaDiscord fontSize={20} />}
              >
                {t('common.discordLabel')}
              </MenuItem>
            )}
          </MenuGroup>
          <MenuGroup title={t('common.settingsLabel')}>
            <HotkeysModal>
              <MenuItem as="button" icon={<FaKeyboard fontSize={20} />}>
                {t('common.hotkeysLabel')}
              </MenuItem>
            </HotkeysModal>
            <SettingsModal>
              <MenuItem as="button" icon={<MdSettings fontSize={20} />}>
                {t('common.settingsLabel')}
              </MenuItem>
            </SettingsModal>
          </MenuGroup>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default memo(SiteHeader);
