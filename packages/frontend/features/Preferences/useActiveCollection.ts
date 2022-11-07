import { Preferences } from '@orpington-news/shared';
import { useGetPreferences } from './queries';

export const useActiveCollection = () => {
  const { data } = useGetPreferences({
    select: (prefs: Preferences) => {
      return {
        activeCollectionId: prefs.activeCollectionId!,
        activeCollectionTitle: prefs.activeCollectionTitle,
        activeCollectionLayout: prefs.activeCollectionLayout,
        activeCollectionFilter: prefs.activeCollectionFilter,
        activeCollectionGrouping: prefs.activeCollectionGrouping,
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
    filter: data.activeCollectionFilter,
    grouping: data.activeCollectionGrouping,
  } as const;
};
