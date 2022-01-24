import { useCallback, useMemo } from 'react';
import { useLocalStorage } from 'beautiful-react-hooks';
import { ActiveCollection } from '@components/collection/types';
import { Collection, ID } from '@orpington-news/shared';
import { useCollectionsTree } from './queries';

const findById = (
  targetId: ID | string,
  collections?: Collection[]
): Collection | undefined => {
  if (!collections) {
    return;
  }
  for (const collection of collections) {
    if (collection.id === targetId) {
      return collection;
    }
    if (collection.children) {
      const childrenNode = findById(targetId, collection.children);
      if (childrenNode) {
        return childrenNode;
      }
    }
  }
  return undefined;
};

export const useActiveCollection = () => {
  const [activeCollectionId, setActiveCollectionId] = useLocalStorage<
    ID | string
  >('activeCollectionId', 'home');

  const handleCollectionClicked = useCallback(
    (collection: Collection) => {
      setActiveCollectionId(collection.id);
    },
    [setActiveCollectionId]
  );

  const { data: collections } = useCollectionsTree();

  const activeCollection: ActiveCollection = useMemo(() => {
    if (activeCollectionId === 'home') {
      return { id: activeCollectionId, title: 'Home' };
    }

    const collection = findById(activeCollectionId, collections);
    return collection
      ? {
          id: activeCollectionId,
          title: collection.title,
        }
      : {
          id: activeCollectionId,
          title: 'Unknown',
        };
  }, [activeCollectionId, collections]);

  return { activeCollection, handleCollectionClicked, setActiveCollectionId };
};
