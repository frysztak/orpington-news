import { useCallback } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useToast } from '@chakra-ui/react';
import { DeleteCollectionModal } from '@components/collection/delete';
import { useDeleteCollection } from './queries';
import { ModalContext } from './ModalContext';

export const DeleteModal: React.FC = () => {
  const toast = useToast();
  const isOpen = useContextSelector(
    ModalContext,
    (ctx) => ctx.isDeleteModalOpen
  );
  const onClose = useContextSelector(
    ModalContext,
    (ctx) => ctx.closeDeleteModal
  );
  const collectionId = useContextSelector(
    ModalContext,
    (ctx) => ctx.deleteModalState
  );

  const { mutate: deleteCollection, isLoading } = useDeleteCollection({
    onSuccess: () => {
      onClose();
      toast({
        status: 'success',
        description: 'Feed deleted!',
        isClosable: true,
      });
    },
  });

  const onDelete = useCallback(() => {
    if (collectionId === undefined) {
      console.error(`Delete collection called, but collectionId is undefined`);
      return;
    }

    deleteCollection({ id: collectionId });
  }, [collectionId, deleteCollection]);

  return (
    <DeleteCollectionModal
      isOpen={isOpen}
      onClose={onClose}
      isLoading={isLoading}
      onDelete={onDelete}
    />
  );
};
