import { Preferences } from '@orpington-news/shared';
import { useGetPreferences } from './queries';

export const useActiveCollection = () => {
  const { data } = useGetPreferences({
    select: (prefs: Preferences) => {
      return {
        activeCollectionId: prefs
          ? prefs.activeView === 'home'
            ? 'home'
            : prefs.activeCollectionId!
          : ('home' as const),
        homeCollectionLayout: prefs.homeCollectionLayout,
        activeCollectionTitle: prefs.activeCollectionTitle,
        activeCollectionLayout: prefs.activeCollectionLayout,
      };
    },
  });

  if (data === undefined) {
    // preferences or collection list are still being loaded
    return;
  }

  return {
    id: data.activeCollectionId,
    title: data.activeCollectionTitle,
    layout: data.activeCollectionLayout,
  } as const;
};
