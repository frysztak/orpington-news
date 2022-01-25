import { useContext, createContext, useState, useCallback } from 'react';
import { useLocalStorage } from 'beautiful-react-hooks';
import { ID } from '@orpington-news/shared';

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

  const [currentlyUpdatedCollections, setCurrentlyUpdatedCollections] =
    useState<Set<ID>>(new Set());

  const addCurrentlyUpdatedCollection = useCallback((ids: Array<ID>) => {
    setCurrentlyUpdatedCollections((set) => {
      const newSet = new Set(set);
      for (const id of ids) {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const deleteCurrentlyUpdatedCollection = useCallback((ids: Array<ID>) => {
    setCurrentlyUpdatedCollections((set) => {
      const newSet = new Set(set);
      for (const id of ids) {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

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
