import {
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import _, { isEqual } from 'lodash';
import { ChangeEvent, cloneElement, ReactElement } from 'react';
import { RootState, useAppDispatch, useAppSelector } from '../../../app/store';
import { persistor } from '../../../main';
import {
  InProgressImageType,
  setShouldConfirmOnDelete,
  setShouldDisplayGuides,
  setShouldDisplayInProgressType,
  SystemState,
} from '../systemSlice';
import ModelList from './ModelList';
import { IN_PROGRESS_IMAGE_TYPES } from '../../../app/constants';
import IAISwitch from '../../../common/components/IAISwitch';
import IAISelect from '../../../common/components/IAISelect';

const systemSelector = createSelector(
  (state: RootState) => state.system,
  (system: SystemState) => {
    const {
      shouldDisplayInProgressType,
      shouldConfirmOnDelete,
      shouldDisplayGuides,
      model_list,
    } = system;
    return {
      shouldDisplayInProgressType,
      shouldConfirmOnDelete,
      shouldDisplayGuides,
      models: _.map(model_list, (_model, key) => key),
    };
  },
  {
    memoizeOptions: { resultEqualityCheck: isEqual },
  }
);

type SettingsModalProps = {
  /* The button to open the Settings Modal */
  children: ReactElement;
};

/**
 * Modal for app settings. Also provides Reset functionality in which the
 * app's localstorage is wiped via redux-persist.
 *
 * Secondary post-reset modal is included here.
 */
const SettingsModal = ({ children }: SettingsModalProps) => {
  const dispatch = useAppDispatch();

  const {
    isOpen: isSettingsModalOpen,
    onOpen: onSettingsModalOpen,
    onClose: onSettingsModalClose,
  } = useDisclosure();

  const {
    isOpen: isRefreshModalOpen,
    onOpen: onRefreshModalOpen,
    onClose: onRefreshModalClose,
  } = useDisclosure();

  const {
    shouldDisplayInProgressType,
    shouldConfirmOnDelete,
    shouldDisplayGuides,
  } = useAppSelector(systemSelector);

  /**
   * Resets localstorage, then opens a secondary modal informing user to
   * refresh their browser.
   * */
  const handleClickResetWebUI = () => {
    persistor.purge().then(() => {
      onSettingsModalClose();
      onRefreshModalOpen();
    });
  };

  return (
    <>
      {cloneElement(children, {
        onClick: onSettingsModalOpen,
      })}

      <Modal isOpen={isSettingsModalOpen} onClose={onSettingsModalClose}>
        <ModalOverlay />
        <ModalContent className="settings-modal">
          <ModalHeader className="settings-modal-header">Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody className="settings-modal-content">
            <div className="settings-modal-items">
              <div className="settings-modal-item">
                <ModelList />
              </div>
              <IAISelect
                styleClass="settings-modal-item"
                label={'Display In-Progress Images'}
                validValues={IN_PROGRESS_IMAGE_TYPES}
                value={shouldDisplayInProgressType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  dispatch(
                    setShouldDisplayInProgressType(
                      e.target.value as InProgressImageType
                    )
                  )
                }
              />

              <IAISwitch
                styleClass="settings-modal-item"
                label={'Confirm on Delete'}
                isChecked={shouldConfirmOnDelete}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  dispatch(setShouldConfirmOnDelete(e.target.checked))
                }
              />
              <IAISwitch
                styleClass="settings-modal-item"
                label={'Display Help Icons'}
                isChecked={shouldDisplayGuides}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  dispatch(setShouldDisplayGuides(e.target.checked))
                }
              />
            </div>

            <div className="settings-modal-reset">
              <Heading size={'md'}>Reset Web UI</Heading>
              <Button colorScheme="red" onClick={handleClickResetWebUI}>
                Reset Web UI
              </Button>
              <Text>
                Resetting the web UI only resets the browser's local cache of
                your images and remembered settings. It does not delete any
                images from disk.
              </Text>
              <Text>
                If images aren't showing up in the gallery or something else
                isn't working, please try resetting before submitting an issue
                on GitHub.
              </Text>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onSettingsModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        closeOnOverlayClick={false}
        isOpen={isRefreshModalOpen}
        onClose={onRefreshModalClose}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(40px)" />
        <ModalContent>
          <ModalBody pb={6} pt={6}>
            <Flex justifyContent={'center'}>
              <Text fontSize={'lg'}>
                Web UI has been reset. Refresh the page to reload.
              </Text>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SettingsModal;
