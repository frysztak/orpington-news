import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  AddCollectionForm,
  AddCollectionFormProps,
} from '@components/collection/add';

export type AddCollectionModalProps = AddCollectionFormProps & {
  isOpen: boolean;
  modalTitle: string;
  onClose: () => void;
};

export const AddCollectionModal: React.FC<AddCollectionModalProps> = (
  props
) => {
  const { isOpen, onClose, modalTitle, ...formProps } = props;

  const size = useBreakpointValue({ base: 'full', sm: 'lg' });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnEsc={false}
      closeOnOverlayClick={false}
      size={size}
    >
      <ModalOverlay />
      <ModalContent p={4}>
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <AddCollectionForm {...formProps} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
