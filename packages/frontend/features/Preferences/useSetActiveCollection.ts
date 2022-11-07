import { useCallback } from 'react';
import { useGetUser } from '@features/Auth';
import { usePutActiveCollection } from './queries';
import { useCollectionById } from '@features/Collections';

export const useSetActiveCollection = () => {
  const { mutate } = usePutActiveCollection();
  const { data: userData } = useGetUser();
  const { data: homeCollection } = useCollectionById(userData?.homeId);

  const setHomeCollection = useCallback(() => {
    if (userData?.homeId === undefined) {
      console.error(`setHomeCollection without homeId!`);
      return;
    }
    if (!homeCollection) {
      console.error(`setHomeCollection without homeCollection!`);
      return;
    }

    mutate({
      activeCollectionId: userData.homeId,
      activeCollectionTitle: homeCollection.title,
      activeCollectionLayout: homeCollection.layout!,
      activeCollectionFilter: homeCollection.filter!,
      activeCollectionGrouping: homeCollection.grouping!,
    });
  }, [homeCollection, mutate, userData?.homeId]);

  return { setActiveCollection: mutate, setHomeCollection };
};
