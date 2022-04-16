import { useCallback, useMemo } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import type { Wretcher } from 'wretch';
import { lensIndex, set } from 'rambda';
import {
  useApi,
  useHandleError,
  getCollections,
  getCollectionItems,
  markCollectionAsRead,
  refreshCollection,
  setCollectionLayout,
} from '@api';
import { collectionKeys } from '@features/queryKeys';
import { inflateCollections } from '@features/OrganizeCollections';
import { CollectionLayout, FlatCollection, ID } from '@orpington-news/shared';

export const useCollectionsList = <TSelectedData>(opts?: {
  select?: (data: FlatCollection[]) => TSelectedData;
}) => {
  const api = useApi();
  const { onError } = useHandleError();

  return useQuery(collectionKeys.tree, () => getCollections(api), {
    onError,
    select: opts?.select,
  });
};

export const useCollectionsTree = () => {
  return useCollectionsList({ select: inflateCollections });
};

export const useCollectionById = (collectionId: ID | string) => {
  return useCollectionsList({
    select: useCallback(
      (collections: FlatCollection[]) =>
        collections?.find(({ id }) => id === collectionId),
      [collectionId]
    ),
  });
};

export const collectionsItemsQueryFn =
  (api: Wretcher, collectionId: ID | string) =>
  ({ pageParam = 0 }) => {
    return getCollectionItems(api, collectionId, pageParam).then((items) => ({
      items,
      pageParam,
    }));
  };

export const useCollectionItems = (collectionId: ID | string) => {
  const api = useApi();
  const { onError } = useHandleError();

  const { data, ...rest } = useInfiniteQuery(
    collectionKeys.list(collectionId),
    collectionsItemsQueryFn(api, collectionId),
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

export const useRefreshCollection = () => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  return useMutation(
    ({ id }: { id: ID | 'home' }) => refreshCollection(api, id),
    {
      onError,
      onSuccess: ({ ids }) => {
        for (const id of ids) {
          queryClient.invalidateQueries(collectionKeys.allForId(id));
        }
        queryClient.invalidateQueries(collectionKeys.tree);
      },
    }
  );
};

export const useSetCollectionLayout = () => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, layout }: { id: ID; layout: CollectionLayout }) =>
      setCollectionLayout(api, id, layout),
    {
      onError,
      onMutate: ({ id, layout }) => {
        queryClient.setQueryData<FlatCollection[]>(
          collectionKeys.tree,
          (oldCollections) => {
            if (!oldCollections) {
              return [];
            }

            const idx = oldCollections.findIndex((c) => c.id === id);
            if (idx === -1) {
              return oldCollections;
            }

            const updatedCollection = {
              ...oldCollections[idx]!,
              layout,
            };

            return set(lensIndex(idx), updatedCollection, oldCollections);
          }
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries(collectionKeys.tree);
      },
    }
  );
};
