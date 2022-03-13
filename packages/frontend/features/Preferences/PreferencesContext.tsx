import { createContext, useCallback, useContext } from 'react';
import type { ID, Preferences } from '@orpington-news/shared';
import {
  useCollapseCollection,
  useExpandCollection,
  useGetPreferences,
  useSetActiveView,
} from './queries';

export interface PreferencesContextData {
  activeCollectionId: ID | 'home';
  setActiveCollectionId: (id: ID | 'home') => void;

  expandedCollectionIds: Array<ID>;
  expandCollection: (id: ID) => void;
  collapseCollection: (id: ID) => void;
}

const PreferencesContext = createContext<PreferencesContextData | null>(null);

export const PreferencesContextProvider: React.FC = ({ children }) => {
  const { data: preferences } = useGetPreferences<Preferences>();
  const { mutate: setActiveView } = useSetActiveView();
  const setActiveCollectionId = useCallback(
    (id: ID | 'home') => {
      setActiveView(
        id === 'home'
          ? { activeView: 'home' }
          : { activeView: 'collection', activeCollectionId: id }
      );
    },
    [setActiveView]
  );

  const { mutate: expandCollection } = useExpandCollection();
  const handleExpandCollection = useCallback(
    (id: ID) => expandCollection({ id }),
    [expandCollection]
  );
  const { mutate: collapseCollection } = useCollapseCollection();
  const handleCollapseCollection = useCallback(
    (id: ID) => collapseCollection({ id }),
    [collapseCollection]
  );

  if (!preferences) {
    return <>{children}</>;
  }

  const activeCollectionId =
    preferences.activeView === 'home' ? 'home' : preferences.activeCollectionId;

  return (
    <PreferencesContext.Provider
      value={{
        activeCollectionId,
        setActiveCollectionId,
        expandedCollectionIds: preferences.expandedCollectionIds,
        expandCollection: handleExpandCollection,
        collapseCollection: handleCollapseCollection,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferencesContext = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error(
      `usePreferencesContext needs to wrapped in PreferencesContextProvider`
    );
  }

  return context;
};
