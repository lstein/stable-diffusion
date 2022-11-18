import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import React, { cloneElement, ReactElement } from 'react';
import HotkeysModalItem from './HotkeysModalItem';

type HotkeysModalProps = {
  /* The button to open the Settings Modal */
  children: ReactElement;
};

type HotkeyList = {
  title: string;
  desc: string;
  hotkey: string;
};

export default function HotkeysModal({ children }: HotkeysModalProps) {
  const {
    isOpen: isHotkeyModalOpen,
    onOpen: onHotkeysModalOpen,
    onClose: onHotkeysModalClose,
  } = useDisclosure();

  const appHotkeys = [
    { title: 'Invoke', desc: 'Generate an image', hotkey: 'Ctrl+Enter' },
    { title: 'Cancel', desc: 'Cancel image generation', hotkey: 'Shift+X' },
    {
      title: 'Focus Prompt',
      desc: 'Focus the prompt input area',
      hotkey: 'Alt+A',
    },
    {
      title: 'Toggle Options',
      desc: 'Open and close the options panel',
      hotkey: 'O',
    },
    {
      title: 'Pin Options',
      desc: 'Pin the options panel',
      hotkey: 'Shift+O',
    },
    {
      title: 'Toggle Viewer',
      desc: 'Open and close Image Viewer',
      hotkey: 'V',
    },
    {
      title: 'Toggle Gallery',
      desc: 'Open and close the gallery drawer',
      hotkey: 'G',
    },
    {
      title: 'Maximize Workspace',
      desc: 'Close panels and maximize work area',
      hotkey: 'F',
    },
    {
      title: 'Change Tabs',
      desc: 'Switch to another workspace',
      hotkey: '1-6',
    },

    {
      title: 'Console Toggle',
      desc: 'Open and close console',
      hotkey: '`',
    },
  ];

  const generalHotkeys = [
    {
      title: 'Set Prompt',
      desc: 'Use the prompt of the current image',
      hotkey: 'P',
    },
    {
      title: 'Set Seed',
      desc: 'Use the seed of the current image',
      hotkey: 'S',
    },
    {
      title: 'Set Parameters',
      desc: 'Use all parameters of the current image',
      hotkey: 'A',
    },
    { title: 'Restore Faces', desc: 'Restore the current image', hotkey: 'R' },
    { title: 'Upscale', desc: 'Upscale the current image', hotkey: 'U' },
    {
      title: 'Show Info',
      desc: 'Show metadata info of the current image',
      hotkey: 'I',
    },
    {
      title: 'Send To Image To Image',
      desc: 'Send current image to Image to Image',
      hotkey: 'Shift+I',
    },
    { title: 'Delete Image', desc: 'Delete the current image', hotkey: 'Del' },
    { title: 'Close Panels', desc: 'Closes open panels', hotkey: 'Esc' },
  ];

  const galleryHotkeys = [
    {
      title: 'Previous Image',
      desc: 'Display the previous image in gallery',
      hotkey: 'Arrow left',
    },
    {
      title: 'Next Image',
      desc: 'Display the next image in gallery',
      hotkey: 'Arrow right',
    },
    {
      title: 'Toggle Gallery Pin',
      desc: 'Pins and unpins the gallery to the UI',
      hotkey: 'Shift+G',
    },
    {
      title: 'Increase Gallery Image Size',
      desc: 'Increases gallery thumbnails size',
      hotkey: 'Shift+Up',
    },
    {
      title: 'Decrease Gallery Image Size',
      desc: 'Decreases gallery thumbnails size',
      hotkey: 'Shift+Down',
    },
  ];

  const unifiedCanvasHotkeys = [
    {
      title: 'Select Brush',
      desc: 'Selects the inpainting brush',
      hotkey: 'B',
    },
    {
      title: 'Select Eraser',
      desc: 'Selects the inpainting eraser',
      hotkey: 'E',
    },
    {
      title: 'Decrease Brush Size',
      desc: 'Decreases the size of the inpainting brush/eraser',
      hotkey: '[',
    },
    {
      title: 'Increase Brush Size',
      desc: 'Increases the size of the inpainting brush/eraser',
      hotkey: ']',
    },
    {
      title: 'Move Tool',
      desc: 'Allows canvas navigation',
      hotkey: 'M',
    },
    {
      title: 'Quick Toggle Move',
      desc: 'Temporarily toggles Move mode',
      hotkey: 'Hold Space',
    },
    {
      title: 'Select Mask Layer',
      desc: 'Toggles mask layer',
      hotkey: 'Q',
    },
    {
      title: 'Clear Mask',
      desc: 'Clear the entire mask',
      hotkey: 'Shift+C',
    },
    {
      title: 'Hide Mask',
      desc: 'Hide and unhide mask',
      hotkey: 'H',
    },
    {
      title: 'Show/Hide Bounding Box',
      desc: 'Toggle visibility of bounding box',
      hotkey: 'Shift+H',
    },
    {
      title: 'Merge Visible',
      desc: 'Merge all visible layers of canvas',
      hotkey: 'Shift+M',
    },
    {
      title: 'Save To Gallery',
      desc: 'Save current canvas to gallery',
      hotkey: 'Shift+S',
    },
    {
      title: 'Copy to Clipboard',
      desc: 'Copy current canvas to clipboard',
      hotkey: 'Ctrl+C',
    },
    {
      title: 'Download Image',
      desc: 'Download current canvas',
      hotkey: 'Shift+D',
    },
    {
      title: 'Undo Stroke',
      desc: 'Undo a brush stroke',
      hotkey: 'Ctrl+Z',
    },
    {
      title: 'Redo Stroke',
      desc: 'Redo a brush stroke',
      hotkey: 'Ctrl+Shift+Z, Ctrl+Y',
    },
    {
      title: 'Reset View',
      desc: 'Reset Canvas View',
      hotkey: 'R',
    },
  ];

  const renderHotkeyModalItems = (hotkeys: HotkeyList[]) => {
    const hotkeyModalItemsToRender: ReactElement[] = [];

    hotkeys.forEach((hotkey, i) => {
      hotkeyModalItemsToRender.push(
        <HotkeysModalItem
          key={i}
          title={hotkey.title}
          description={hotkey.desc}
          hotkey={hotkey.hotkey}
        />
      );
    });

    return (
      <div className="hotkey-modal-category">{hotkeyModalItemsToRender}</div>
    );
  };

  return (
    <>
      {cloneElement(children, {
        onClick: onHotkeysModalOpen,
      })}
      <Modal isOpen={isHotkeyModalOpen} onClose={onHotkeysModalClose}>
        <ModalOverlay />
        <ModalContent className=" modal hotkeys-modal">
          <ModalCloseButton className="modal-close-btn" />

          <h1>Keyboard Shorcuts</h1>
          <div className="hotkeys-modal-items">
            <Accordion allowMultiple>
              <AccordionItem>
                <AccordionButton className="hotkeys-modal-button">
                  <h2>App Hotkeys</h2>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  {renderHotkeyModalItems(appHotkeys)}
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton className="hotkeys-modal-button">
                  <h2>General Hotkeys</h2>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  {renderHotkeyModalItems(generalHotkeys)}
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton className="hotkeys-modal-button">
                  <h2>Gallery Hotkeys</h2>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  {renderHotkeyModalItems(galleryHotkeys)}
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton className="hotkeys-modal-button">
                  <h2>Unified Canvas Hotkeys</h2>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  {renderHotkeyModalItems(unifiedCanvasHotkeys)}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
