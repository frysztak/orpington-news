import { useContext, createContext, useState, useEffect } from 'react';
import { FlatCollection, ID } from '@orpington-news/shared';
import { useSet } from '@utils';
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
