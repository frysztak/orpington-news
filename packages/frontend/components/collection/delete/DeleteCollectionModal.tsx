import React from 'react';
import { AlertDialog } from '@components/alertDialog';

export interface DeleteCollectionModalProps {
  isOpen: boolean;
  isLoading?: boolean;

  onClose: () => void;
  onDelete: () => void;
}

export const DeleteCollectionModal: React.FC<DeleteCollectionModalProps> = (
  props
) => {
  const { isOpen, isLoading, onClose, onDelete } = props;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={onClose}
      isDeleting={isLoading}
      title="Delete feed"
      description="Are you sure? You can't undo this action afterwards."
      actionLabel="Delete"
      onAction={onDelete}
    />
  );
};
