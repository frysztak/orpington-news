import { ID } from '@orpington-news/shared';
import { useCallback } from 'react';
import { useSetActiveView } from './queries';

export const useSetActiveCollection = () => {
  const { mutate: setActiveView } = useSetActiveView();
  const setActiveCollection = useCallback(
    (id: ID | 'home') => {
      setActiveView(
        id === 'home'
          ? { activeView: 'home' }
          : { activeView: 'collection', activeCollectionId: id }
      );
    },
    [setActiveView]
  );

  return { setActiveCollection };
};
