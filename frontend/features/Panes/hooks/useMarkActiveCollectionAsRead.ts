import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useMarkCollectionAsRead } from '@features/Collections';
import { useActiveCollection } from '@features/Preferences';

export const useMarkActiveCollectionAsRead = () => {
  const toast = useToast();
  const activeCollection = useActiveCollection();

  const { mutate: markCollectionAsRead } = useMarkCollectionAsRead();
  const handleMarkAsRead = useCallback(() => {
    if (activeCollection) {
      markCollectionAsRead(
        { id: activeCollection.id },
        {
          onSuccess: () => {
            toast({
              description: 'Feed marked as read',
              status: 'success',
              isClosable: true,
            });
          },
        }
      );
    } else {
      console.error(`handleMarkAsRead() without active collection`);
    }
  }, [activeCollection, markCollectionAsRead, toast]);

  return {
    handleMarkAsRead,
  };
};
