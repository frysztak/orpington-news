import { useCallback, useMemo } from 'react';
import { ActiveCollection } from '@components/collection/types';
import { Collection } from '@orpington-news/shared';
import { useCollectionById } from '@features/Collections';
import { useActiveCollectionContext } from './ActiveCollectionContext';

export const useActiveCollection = () => {
  const { activeCollectionId, setActiveCollectionId } =
    useActiveCollectionContext();

  const handleCollectionClicked = useCallback(
    (collection: Collection) => {
      setActiveCollectionId(collection.id);
    },
    [setActiveCollectionId]
  );

  const { data: collection } = useCollectionById(activeCollectionId);

  const activeCollection: ActiveCollection = useMemo(() => {
    if (activeCollectionId === 'home') {
      return { id: activeCollectionId, title: 'Home' };
    }

    return collection
      ? {
          id: activeCollectionId,
          title: collection.title,
        }
      : {
          id: activeCollectionId,
          title: '',
        };
  }, [activeCollectionId, collection]);

  return { activeCollection, handleCollectionClicked, setActiveCollectionId };
};
