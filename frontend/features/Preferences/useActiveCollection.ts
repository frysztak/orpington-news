import { Preferences, ActiveCollection } from '@shared';
import { useGetPreferences } from './queries';

export const useActiveCollection = () => {
  const { data } = useGetPreferences({
    select: (prefs: Preferences): ActiveCollection => {
      return {
        id: prefs.activeCollectionId!,
        title: prefs.activeCollectionTitle,
        layout: prefs.activeCollectionLayout,
        filter: prefs.activeCollectionFilter,
        grouping: prefs.activeCollectionGrouping,
        sortBy: prefs.activeCollectionSortBy,
      };
    },
  });

  return data;
};
