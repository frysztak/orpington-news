import {
  CollectionFilter,
  CollectionGrouping,
  CollectionLayout,
  ID,
} from '@orpington-news/shared';
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
      filter: CollectionFilter;
      grouping: CollectionGrouping;
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
              activeCollectionFilter: data.filter,
              activeCollectionGrouping: data.grouping,
            }
      );
    },
    [setActiveView]
  );

  return { setActiveCollection };
};
