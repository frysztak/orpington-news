import { Modal, ModalCloseButton, ModalHeader } from '@components/modal';
import React from 'react';
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
      open={isOpen}
      onOpenChange={onClose}
      contentTestId="addCollectionModal"
    >
      <ModalHeader>{modalTitle}</ModalHeader>
      <ModalCloseButton />
      <AddCollectionForm {...formProps} />
    </Modal>
  );
};
