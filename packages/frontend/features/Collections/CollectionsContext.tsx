import {
  useContext,
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useQueryClient } from 'react-query';
import { FlatCollection, ID, Msg } from '@orpington-news/shared';
import { useSet } from '@utils';
import { collectionKeys } from '@features/queryKeys';
import { useAddEventListener } from '@features/EventListener';
import { useCollectionsList, buildParentsChildrenMap, getParents } from '.';

export interface CollectionsContextData {
  currentlyUpdatedCollections: Set<ID>;
  addCurrentlyUpdatedCollection: (ids: Array<ID>) => void;
  deleteCurrentlyUpdatedCollection: (ids: Array<ID>) => void;
}

const CollectionsContext = createContext<CollectionsContextData | null>(null);

export const CollectionsContextProvider: React.FC = ({ children }) => {
  const {
    set: currentlyUpdatedCollections,
    add: addCurrentlyUpdatedCollection,
    remove: deleteCurrentlyUpdatedCollection,
  } = useCurrentlyUpdatedCollections();

  const queryClient = useQueryClient();
  const eventHandler = useCallback(
    (msg: Msg) => {
      switch (msg.type) {
        case 'updatingFeeds': {
          return addCurrentlyUpdatedCollection(msg.data.feedIds);
        }
        case 'updatedFeeds': {
          for (const feedId of msg.data.feedIds) {
            queryClient.invalidateQueries(collectionKeys.list(feedId));
          }
          queryClient.invalidateQueries(collectionKeys.tree);
          return deleteCurrentlyUpdatedCollection(msg.data.feedIds);
        }
      }
    },
    [
      addCurrentlyUpdatedCollection,
      deleteCurrentlyUpdatedCollection,
      queryClient,
    ]
  );
  useAddEventListener(eventHandler);

  return (
    <CollectionsContext.Provider
      value={{
        currentlyUpdatedCollections,
        addCurrentlyUpdatedCollection,
        deleteCurrentlyUpdatedCollection,
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
  const { data: flatCollections } = useCollectionsList<FlatCollection[]>();

  const [parentsMap, setParentsMap] = useState(
    buildParentsChildrenMap(flatCollections).parentsMap
  );
  useEffect(() => {
    setParentsMap(buildParentsChildrenMap(flatCollections).parentsMap);
  }, [flatCollections]);

  const { set, add, remove } = useSet<ID>();
  const { set: parentsSet, setValue: setParentsSet } = useSet<ID>();
  const { set: combinedSet, setValue: setCombinedSet } = useSet<ID>();

  useEffect(() => {
    const parents = Array.from(set.values()).flatMap((id: ID) =>
      getParents(parentsMap, id)
    );
    setParentsSet(new Set(parents));
  }, [set, setParentsSet, parentsMap]);

  useEffect(() => {
    const newSet = new Set(set);
    for (let elem of parentsSet) {
      newSet.add(elem);
    }
    setCombinedSet(newSet);
  }, [set, parentsSet, setCombinedSet]);

  return {
    set: combinedSet,
    add,
    remove,
  };
};
