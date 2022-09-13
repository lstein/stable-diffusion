import {
  IconButton,
  IconButtonProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { MouseEventHandler } from 'react';
import { MdDeleteForever } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { deleteImage } from '../../app/socketio';
import { RootState } from '../../app/store';
import SDButton from '../../components/SDButton';
import { setShouldConfirmOnDelete } from '../system/systemSlice';
import { SDImage } from './gallerySlice';

interface Props extends IconButtonProps {
  image: SDImage;
  'aria-label': string;
}

/*
TODO: The modal and button to open it should be two different components,
but their state is closely related and I'm not sure how best to accomplish it.
*/
const DeleteImageModalButton = (props: Omit<Props, 'aria-label'>) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useAppDispatch();
  const { shouldConfirmOnDelete } = useAppSelector(
    (state: RootState) => state.system
  );

  const handleClickDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    shouldConfirmOnDelete ? onOpen() : handleDelete();
  };

  const { image, size, fontSize } = props;

  const handleDelete = () => {
    dispatch(deleteImage(image));
    onClose();
  };

  const handleDeleteAndDontAsk = () => {
    dispatch(deleteImage(image));
    dispatch(setShouldConfirmOnDelete(false));
    onClose();
  };

  return (
    <>
      <Tooltip label='Delete image'>
        <IconButton
          aria-label='Delete image'
          icon={<MdDeleteForever />}
          onClickCapture={handleClickDelete}
          size={size}
          fontSize={fontSize}
          {...props}
        />
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Are you sure you want to delete this image?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>It will be deleted forever!</Text>
          </ModalBody>

          <ModalFooter justifyContent={'space-between'}>
            <SDButton label={'Yes'} colorScheme='red' onClick={handleDelete} />
            <SDButton
              label={"Yes, and don't ask me again"}
              colorScheme='red'
              onClick={handleDeleteAndDontAsk}
            />
            <SDButton label='Cancel' colorScheme='blue' onClick={onClose} />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeleteImageModalButton;
