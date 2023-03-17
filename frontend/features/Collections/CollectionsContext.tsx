import { useContext, createContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Collection, ID, Msg } from '@shared';
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
          for (const feedId of msg.data.affectedFeedIds) {
            queryClient.invalidateQueries(collectionKeys.allForId(feedId));
          }

          if (msg.data.unreadCount) {
            const counts = msg.data.unreadCount.counts;
            queryClient.setQueryData(
              collectionKeys.tree,
              (old?: Collection[]) => {
                if (!old) {
                  return old;
                }

                return old.map((collection) => ({
                  ...collection,
                  unreadCount: counts[collection.id] ?? collection.unreadCount,
                }));
              },
              {
                updatedAt: msg.data.unreadCount.updatedAt,
              }
            );
          }

          return currentlyUpdatedCollections.remove(msg.data.refreshedFeedIds);
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
