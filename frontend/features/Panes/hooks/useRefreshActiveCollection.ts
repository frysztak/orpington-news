import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useRefreshCollection } from '@features/Collections';
import { useActiveCollection } from '@features/Preferences';

export const useRefreshActiveCollection = () => {
  const toast = useToast();
  const activeCollection = useActiveCollection();

  const { mutate: refreshCollection, isLoading: isRefreshing } =
    useRefreshCollection();
  const handleRefreshClick = useCallback(() => {
    if (activeCollection) {
      const collectionId = activeCollection.id;

      refreshCollection(
        { id: collectionId },
        {
          onSuccess: () => {
            toast({
              description: 'Feed updated',
              status: 'success',
              isClosable: true,
            });
          },
        }
      );
    } else {
      console.error(`handleRefreshClick() without active collection`);
    }
  }, [activeCollection, refreshCollection, toast]);

  return {
    handleRefreshClick,
    isRefreshing,
  };
};
