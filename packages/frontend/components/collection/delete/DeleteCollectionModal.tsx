import React, { useRef } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';

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
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      closeOnEsc={!isLoading}
      closeOnOverlayClick={!isLoading}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete feed
          </AlertDialogHeader>
          <AlertDialogCloseButton isDisabled={isLoading} />

          <AlertDialogBody>
            Are you sure? You can&apos;t undo this action afterwards.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              isLoading={isLoading}
              data-test="cancel"
            >
              Cancel
            </Button>

            <Button
              colorScheme="red"
              onClick={onDelete}
              ml={3}
              isLoading={isLoading}
              data-test="confirmDelete"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
