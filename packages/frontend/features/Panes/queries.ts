import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import {
  useApi,
  useHandleError,
  getCollections,
  getCollectionItems,
  markCollectionAsRead,
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

export const useMarkCollectionAsRead = () => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  return useMutation(({ id }: { id: ID }) => markCollectionAsRead(api, id), {
    onError,
    onSuccess: ({ ids }) => {
      for (const id of ids) {
        queryClient.invalidateQueries(collectionKeys.allForId(id));
      }
      queryClient.invalidateQueries(collectionKeys.tree);
    },
  });
};
