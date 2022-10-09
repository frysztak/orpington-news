import { CollectionLayout, ID } from '@orpington-news/shared';
import { useCallback } from 'react';
import { useSetActiveView } from './queries';

type SetActiveCollectionData =
  | {
      id: 'home';
    }
  | {
      id: ID;
      title: string;
      layout: CollectionLayout;
    };

export const useSetActiveCollection = () => {
  const { mutate: setActiveView } = useSetActiveView();
  const setActiveCollection = useCallback(
    (data: SetActiveCollectionData) => {
      setActiveView(
        data.id === 'home'
          ? {
              activeView: 'home',
              activeCollectionTitle: 'Home',
            }
          : {
              activeView: 'collection',
              activeCollectionId: data.id,
              activeCollectionTitle: data.title,
              activeCollectionLayout: data.layout,
            }
      );
    },
    [setActiveView]
  );

  return { setActiveCollection };
};
