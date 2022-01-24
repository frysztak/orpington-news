import { useContext, createContext } from 'react';
import { useLocalStorage } from 'beautiful-react-hooks';
import { ID } from '@orpington-news/shared';

export interface ActiveCollectionContextData {
  activeCollectionId: ID | string;
  setActiveCollectionId: (id: ID | string) => void;
}

const ActiveCollectionContext =
  createContext<ActiveCollectionContextData | null>(null);

export const ActiveCollectionContextProvider: React.FC = ({ children }) => {
  const [activeCollectionId, setActiveCollectionId] = useLocalStorage<
    ID | string
  >('activeCollectionId', 'home');

  return (
    <ActiveCollectionContext.Provider
      value={{
        activeCollectionId,
        setActiveCollectionId,
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
