import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import { AddCollectionForm, AddCollectionFormProps } from './AddCollectionForm';

export type AddCollectionModalProps = AddCollectionFormProps & {
  isOpen: boolean;
  modalTitle: string;
  onClose: () => void;
};

export const AddCollectionModal: React.FC<AddCollectionModalProps> = (
  props
) => {
  const { isOpen, onClose, modalTitle, ...formProps } = props;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnEsc={false}
      closeOnOverlayClick={false}
      size={{ base: 'full', sm: 'lg' }}
    >
      <ModalOverlay />
      <ModalContent data-test="addCollectionModal">
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <AddCollectionForm {...formProps} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
