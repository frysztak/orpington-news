import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import {
  AddCollectionForm,
  AddCollectionFormProps,
} from '@components/collection/add';

export type AddCollectionModalProps = AddCollectionFormProps & {
  isOpen: boolean;
  onClose: () => void;
};

export const AddCollectionModal: React.FC<AddCollectionModalProps> = (
  props
) => {
  const { isOpen, onClose, ...formProps } = props;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnEsc={false}
      closeOnOverlayClick={false}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent p={4}>
        <ModalHeader>Add feed</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <AddCollectionForm {...formProps} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
