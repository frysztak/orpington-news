import React from 'react';
import { useContextSelector } from 'use-context-selector';
import { Modal, ModalCloseButton, ModalHeader } from '@components/modal';
import { HotkeysGuide } from '@features/HotKeys/HotkeysGuide';
import { ModalContext } from './ModalContext';
import { useHotkeysModal } from './useHotkeysModal';

export interface HotkeysModalProps {}

export const HotkeysModal: React.FC<HotkeysModalProps> = ({}) => {
  useHotkeysModal();
  const isOpen = useContextSelector(
    ModalContext,
    (ctx) => ctx.isHotkeysModalOpen
  );
  const onClose = useContextSelector(
    ModalContext,
    (ctx) => ctx.closeHotkeysModal
  );
  const scopes = useContextSelector(
    ModalContext,
    (ctx) => ctx.hotkeysModalState
  );

  return (
    <Modal open={isOpen} onOpenChange={onClose} contentTestId="hotkeysModal">
      <ModalHeader>Active hotkeys</ModalHeader>
      <ModalCloseButton />
      <HotkeysGuide scopes={scopes as any} />
    </Modal>
  );
};
