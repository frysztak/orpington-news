import { useCallback, useMemo } from 'react';
import { ActiveCollection } from '@components/collection/types';
import { Collection, defaultCollectionLayout } from '@orpington-news/shared';
import { useCollectionById } from '@features/Collections';
import { usePreferencesContext } from './PreferencesContext';

export const useActiveCollection = () => {
  const { preferences, activeCollectionId, setActiveCollectionId } =
    usePreferencesContext();

  const handleCollectionClicked = useCallback(
    (collection: Collection) => {
      setActiveCollectionId(collection.id);
    },
    [setActiveCollectionId]
  );

  const { data: collection } = useCollectionById(activeCollectionId);

  const activeCollection: ActiveCollection = useMemo(() => {
    if (activeCollectionId === 'home') {
      return {
        id: activeCollectionId,
        title: 'Home',
        layout: preferences?.homeCollectionLayout ?? defaultCollectionLayout,
      };
    }

    return {
      id: activeCollectionId,
      title: collection?.title ?? '',
      layout: collection?.layout ?? defaultCollectionLayout,
    };
  }, [activeCollectionId, collection, preferences?.homeCollectionLayout]);

  return { activeCollection, handleCollectionClicked, setActiveCollectionId };
};
