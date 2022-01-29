import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import { SettingsForm, SettingsFormProps } from './SettingsForm';

export type SettingsModalProps = SettingsFormProps & {
  isOpen: boolean;
  onClose: () => void;
};

export const SettingsModal: React.FC<SettingsModalProps> = (props) => {
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
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SettingsForm {...formProps} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
