import { useMemo } from 'react';
import { ActiveCollection } from '@components/collection/types';
import { defaultCollectionLayout, Preferences } from '@orpington-news/shared';
import { useCollectionById } from '@features/Collections';
import { useGetPreferences } from './queries';

export const useActiveCollection = () => {
  const { data } = useGetPreferences({
    select: (prefs: Preferences) => {
      return {
        activeCollectionId: prefs
          ? prefs.activeView === 'home'
            ? 'home'
            : prefs.activeCollectionId
          : ('home' as const),
        homeCollectionLayout: prefs.homeCollectionLayout,
      };
    },
  });
  const activeCollectionId = data!.activeCollectionId;
  const { data: collection } = useCollectionById(activeCollectionId);

  const activeCollection: ActiveCollection = useMemo(() => {
    if (activeCollectionId === 'home') {
      return {
        id: activeCollectionId,
        title: 'Home',
        layout: data?.homeCollectionLayout ?? defaultCollectionLayout,
      };
    }

    return {
      id: activeCollectionId,
      title: collection?.title ?? '',
      layout: collection?.layout ?? defaultCollectionLayout,
    };
  }, [activeCollectionId, collection, data?.homeCollectionLayout]);

  return { activeCollection };
};
