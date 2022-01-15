import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import {
  useApi,
  useHandleError,
  getCollections,
  getCollectionItems,
} from '@api';
import { collectionKeys } from '@features/queryKeys';
import { ID } from '@orpington-news/shared';

export const useCollectionsTree = () => {
  const api = useApi();
  const { onError } = useHandleError();

  return useQuery(collectionKeys.tree, () => getCollections(api), { onError });
};

export const useCollectionItems = (collectionId: ID | string) => {
  const api = useApi();
  const { onError } = useHandleError();

  const { data, ...rest } = useInfiniteQuery(
    collectionKeys.list(collectionId),
    ({ pageParam = 0 }) => {
      return getCollectionItems(api, collectionId, pageParam).then((items) => ({
        items,
        pageParam,
      }));
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.items.length === 0 ? undefined : lastPage.pageParam + 1,
      onError,
    }
  );

  const allItems = useMemo(() => {
    return data?.pages.flatMap((page) => [...page.items]) || [];
  }, [data]);

  return { ...rest, data, allItems };
};
