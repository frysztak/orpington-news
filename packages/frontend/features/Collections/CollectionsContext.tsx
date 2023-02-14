import { useContext, createContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ID, Msg } from '@orpington-news/shared';
import { useSet } from '@utils';
import { collectionKeys } from '@features/queryKeys';
import { useAddEventListener } from '@features/EventListener';
import { ReactFCC } from '@utils/react';
import { useCollectionsList, buildParentsChildrenMap, getParents } from '.';

interface CollectionSet {
  set: Set<ID>;
  add: (ids: Array<ID>) => void;
  remove: (ids: Array<ID>) => void;
}

export interface CollectionsContextData {
  currentlyUpdatedCollections: CollectionSet;
  beingMarkedAsRead: CollectionSet;
}

const CollectionsContext = createContext<CollectionsContextData | null>(null);

export const CollectionsContextProvider: ReactFCC = ({ children }) => {
  const currentlyUpdatedCollections = useCurrentlyUpdatedCollections();

  const queryClient = useQueryClient();
  const eventHandler = useCallback(
    (msg: Msg) => {
      switch (msg.type) {
        case 'updatingFeeds': {
          return currentlyUpdatedCollections.add(msg.data.feedIds);
        }
        case 'updatedFeeds': {
          for (const feedId of msg.data.feedIds) {
            queryClient.invalidateQueries(collectionKeys.allForId(feedId));
          }
          queryClient.invalidateQueries(collectionKeys.tree);
          return currentlyUpdatedCollections.remove(msg.data.feedIds);
        }
      }
    },
    [currentlyUpdatedCollections, queryClient]
  );
  useAddEventListener(eventHandler);

  const beingMarkedAsRead = useMarkAsReadCollections();

  return (
    <CollectionsContext.Provider
      value={{
        currentlyUpdatedCollections,
        beingMarkedAsRead,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
};

export const useCollectionsContext = () => {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error(
      `useCollectionsContext needs to wrapped in CollectionsContextProvider`
    );
  }

  return context;
};

const useCurrentlyUpdatedCollections = () => {
  const { data: parentsMap = new Map() } = useCollectionsList({
    select: (Collections) => {
      return buildParentsChildrenMap(Collections).parentsMap;
    },
  });

  const { set, add, remove } = useSet<ID>();

  const handleAdd = useCallback(
    (ids: ID[]) => {
      const parents = ids.flatMap((id: ID) => getParents(parentsMap, id));
      add([...ids, ...parents]);
    },
    [add, parentsMap]
  );

  const handleRemove = useCallback(
    (ids: ID[]) => {
      const parents = ids.flatMap((id: ID) => getParents(parentsMap, id));
      remove([...ids, ...parents]);
    },
    [remove, parentsMap]
  );

  return {
    set,
    add: handleAdd,
    remove: handleRemove,
  };
};

const useMarkAsReadCollections = () => {
  const { set, add, remove } = useSet<ID>();

  return {
    set,
    add,
    remove,
  };
};
