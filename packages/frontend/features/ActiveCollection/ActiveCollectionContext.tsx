import { useContext, createContext, useState, useEffect } from 'react';
import { useLocalStorage } from 'beautiful-react-hooks';
import { FlatCollection, ID } from '@orpington-news/shared';
import {
  useCollectionsList,
  buildParentsChildrenMap,
  getParents,
} from '@features/Collections';
import { useSet } from '@utils';

export interface ActiveCollectionContextData {
  activeCollectionId: ID | string;
  setActiveCollectionId: (id: ID | string) => void;

  currentlyUpdatedCollections: Set<ID>;
  addCurrentlyUpdatedCollection: (ids: Array<ID>) => void;
  deleteCurrentlyUpdatedCollection: (ids: Array<ID>) => void;
}

const ActiveCollectionContext =
  createContext<ActiveCollectionContextData | null>(null);

export const ActiveCollectionContextProvider: React.FC = ({ children }) => {
  const [activeCollectionId, setActiveCollectionId] = useLocalStorage<
    ID | string
  >('activeCollectionId', 'home');

  const {
    set: currentlyUpdatedCollections,
    add: addCurrentlyUpdatedCollection,
    remove: deleteCurrentlyUpdatedCollection,
  } = useCurrentlyUpdatedCollections();

  return (
    <ActiveCollectionContext.Provider
      value={{
        activeCollectionId,
        setActiveCollectionId,
        currentlyUpdatedCollections,
        addCurrentlyUpdatedCollection,
        deleteCurrentlyUpdatedCollection,
      }}
    >
      {children}
    </ActiveCollectionContext.Provider>
  );
};

export const useActiveCollectionContext = () => {
  const context = useContext(ActiveCollectionContext);
  if (!context) {
    throw new Error(
      `useActiveCollectionContext needs to wrapped in ActiveCollectionContextProvider`
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
