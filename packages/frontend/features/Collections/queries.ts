import { useCallback, useMemo } from 'react';
import {
  QueryFunctionContext,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { lensIndex, set } from 'rambda';
import {
  useApi,
  useHandleError,
  getCollections,
  getCollectionItems,
  markCollectionAsRead,
  refreshCollection,
  setCollectionLayout,
  Wretch,
} from '@api';
import { collectionKeys, preferencesKeys } from '@features/queryKeys';
import type {
  CollectionItem,
  CollectionLayout,
  FlatCollection,
  ID,
  Preferences,
} from '@orpington-news/shared';
import { mutatePageData } from '@utils';
import { useCollectionsContext } from './CollectionsContext';

export const useCollectionsList = <TSelectedData = FlatCollection[]>(opts?: {
  enabled?: boolean;
  select?: (data: FlatCollection[]) => TSelectedData;
}) => {
  const api = useApi();
  const { onError } = useHandleError();

  return useQuery(collectionKeys.tree, () => getCollections(api), {
    onError,
    select: opts?.select,
    enabled: opts?.enabled,
    refetchOnMount: false,
  });
};

export const useCollectionById = (collectionId?: ID | string | null) => {
  return useCollectionsList({
    enabled: collectionId !== undefined,
    select: useCallback(
      (collections: FlatCollection[]) =>
        collections.find(({ id }) => id === collectionId) ?? null,
      [collectionId]
    ),
  });
};

export const collectionsItemsQueryFn =
  (api: Wretch, collectionId: ID | string) =>
  ({ pageParam = 0, signal }: QueryFunctionContext) => {
    return getCollectionItems(api, signal, collectionId, pageParam).then(
      (items) => ({
        items,
        pageParam,
      })
    );
  };

export const useCollectionItems = (collectionId?: ID | string) => {
  const api = useApi();
  const { onError } = useHandleError();

  const { data, ...rest } = useInfiniteQuery(
    collectionKeys.list(collectionId!),
    collectionsItemsQueryFn(api, collectionId!),
    {
      enabled: collectionId !== undefined,
      getNextPageParam: (lastPage) =>
        lastPage.items.length === 0 ? undefined : lastPage.pageParam + 1,
      onError,
    }
  );

  const allItems = useMemo(() => {
    return data?.pages?.flatMap((page) => [...page.items]) || [];
  }, [data]);

  return { ...rest, data, allItems };
};

export const useMarkCollectionAsRead = () => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();
  const { beingMarkedAsRead } = useCollectionsContext();

  return useMutation(
    ({ id }: { id: ID | 'home' }) => markCollectionAsRead(api, id),
    {
      onMutate: ({ id }) => {
        if (typeof id === 'number') {
          beingMarkedAsRead.add([id]);
        }
      },
      onError,
      onSuccess: ({ ids, collections, timestamp }) => {
        queryClient.setQueryData(collectionKeys.tree, collections);

        for (const id of ids) {
          queryClient.setQueryData(
            collectionKeys.list(id),
            mutatePageData<CollectionItem>((item) => ({
              ...item,
              dateRead: timestamp,
            }))
          );

          queryClient.invalidateQueries(collectionKeys.allForId(id));
        }

        queryClient.setQueryData(
          collectionKeys.list('home'),
          mutatePageData<CollectionItem>((item) =>
            ids.includes(item.collection.id)
              ? { ...item, dateRead: timestamp }
              : item
          )
        );
        queryClient.invalidateQueries(collectionKeys.allForId('home'));
        queryClient.invalidateQueries(collectionKeys.tree);
      },
      onSettled: (_, __, { id }) => {
        if (typeof id === 'number') {
          beingMarkedAsRead.remove([id]);
        }
      },
    }
  );
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
    ({ id, layout }: { id: ID | 'home'; layout: CollectionLayout }) =>
      setCollectionLayout(api, id, layout),
    {
      onError,
      onMutate: ({ id, layout }) => {
        if (id === 'home') {
          queryClient.setQueryData(
            preferencesKeys.base,
            (old?: Preferences) =>
              old && {
                ...old,
                homeCollectionLayout: layout,
              }
          );

          return;
        }

        queryClient.setQueryData(
          preferencesKeys.base,
          (old?: Preferences) =>
            old && {
              ...old,
              activeCollectionLayout: layout,
            }
        );

        queryClient.setQueryData(
          collectionKeys.tree,
          (old?: FlatCollection[]) => {
            if (!old) {
              return old;
            }

            const idx = old.findIndex((c) => c.id === id);
            if (idx === -1) {
              return old;
            }

            const updatedCollection = {
              ...old[idx]!,
              layout,
            };

            return set(lensIndex(idx), updatedCollection, old);
          }
        );
      },
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(preferencesKeys.base);

        if (id !== 'home') {
          queryClient.invalidateQueries(collectionKeys.tree);
        }
      },
    }
  );
};
