import { useCallback } from 'react';
import { useGetUserHomeId } from '@features/Auth';
import { usePutActiveCollection } from './queries';
import { useCollectionById } from '@features/Collections';

export const useSetActiveCollection = () => {
  const { mutate } = usePutActiveCollection();
  const homeId = useGetUserHomeId();
  const { data: homeCollection } = useCollectionById(homeId);

  const setHomeCollection = useCallback(() => {
    if (homeId === undefined) {
      console.error(`setHomeCollection without homeId!`);
      return;
    }
    if (!homeCollection) {
      console.error(`setHomeCollection without homeCollection!`);
      return;
    }

    mutate({
      activeCollectionId: homeId,
      activeCollectionTitle: homeCollection.title,
      activeCollectionLayout: homeCollection.layout!,
      activeCollectionFilter: homeCollection.filter!,
      activeCollectionGrouping: homeCollection.grouping!,
      activeCollectionSortBy: homeCollection.sortBy!,
    });
  }, [homeCollection, homeId, mutate]);

  return { setActiveCollection: mutate, setHomeCollection };
};
