import { useCallback, useState } from 'react';
import { useDisclosure, useToast } from '@chakra-ui/react';
import { ID } from '@orpington-news/shared';
import { useActiveCollection } from '@features/ActiveCollection';
import { useDeleteCollection } from './queries';

export const useDeleteCollectionModal = () => {
  const toast = useToast();
  const [collectionId, setCollectionId] = useState<ID>();
  const { activeCollection, setActiveCollectionId } = useActiveCollection();

  const { isOpen, onClose, onOpen } = useDisclosure();
  const { mutate: deleteCollection, isLoading } = useDeleteCollection({
    onSuccess: (childrenIds: ID[]) => {
      onClose();
      toast({
        status: 'success',
        description: 'Feed deleted!',
        isClosable: true,
      });

      if (
        typeof activeCollection.id === 'number' &&
        childrenIds.includes(activeCollection.id)
      ) {
        setActiveCollectionId('home');
      }
    },
  });

  const onOpenDeleteCollectionModal = useCallback(
    (id: ID) => {
      setCollectionId(id);
      onOpen();
    },
    [onOpen]
  );

  const onDelete = useCallback(() => {
    if (collectionId === undefined) {
      console.error(`Delete collection called, but collectionId is undefined`);
      return;
    }

    deleteCollection({ id: collectionId });
  }, [collectionId, deleteCollection]);

  return {
    onOpenDeleteCollectionModal,
    isOpen,
    onClose,
    isLoading,

    onDelete,
  };
};
