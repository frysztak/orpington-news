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
  const activeCollectionId = data?.activeCollectionId;
  const { data: collection } = useCollectionById(activeCollectionId);

  if (collection === undefined || activeCollectionId === undefined) {
    // collection list is still being loaded
    return;
  } else if (collection === null || activeCollectionId === 'home') {
    // collection with given ID was not found, or home collection is active
    return {
      id: 'home',
      title: 'Home',
      layout: data?.homeCollectionLayout ?? defaultCollectionLayout,
    } as const;
  }

  return {
    id: activeCollectionId!,
    title: collection?.title ?? '',
    layout: collection?.layout ?? defaultCollectionLayout,
  } as const;
};
