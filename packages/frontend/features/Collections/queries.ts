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
  setCollectionPreferences,
  Wretch,
} from '@api';
import { collectionKeys, preferencesKeys } from '@features/queryKeys';
import {
  CollectionItem,
  Collection,
  ID,
  Preferences,
  CollectionFilter,
  defaultCollectionFilter,
} from '@orpington-news/shared';
import { mutatePageData } from '@utils';
import { useCollectionsContext } from './CollectionsContext';

export const useCollectionsList = <TSelectedData = Collection[]>(opts?: {
  enabled?: boolean;
  select?: (data: Collection[]) => TSelectedData;
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
      (collections: Collection[]) =>
        collections.find(({ id }) => id === collectionId) ?? null,
      [collectionId]
    ),
  });
};

export const collectionsItemsQueryFn =
  (api: Wretch, collectionId: ID | string, filter: CollectionFilter) =>
  ({ pageParam = 0, signal }: QueryFunctionContext) => {
    return getCollectionItems(
      api,
      signal,
      collectionId,
      pageParam,
      filter
    ).then((items) => ({
      items,
      pageParam,
    }));
  };

export const useCollectionItems = (
  collectionId?: ID | string,
  filter: CollectionFilter = defaultCollectionFilter
) => {
  const api = useApi();
  const { onError } = useHandleError();

  const { data, ...rest } = useInfiniteQuery(
    collectionKeys.list(collectionId!, filter),
    collectionsItemsQueryFn(api, collectionId!, filter),
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

type CollectionPreferences = Pick<Collection, 'layout' | 'filter' | 'grouping'>;

export const useSetCollectionPreferences = () => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, preferences }: { id: ID; preferences: CollectionPreferences }) =>
      setCollectionPreferences(api, id, preferences),
    {
      onError,
      onMutate: ({ id, preferences }) => {
        queryClient.setQueryData(
          preferencesKeys.base,
          (old?: Preferences) =>
            old && {
              ...old,
              activeCollectionLayout:
                preferences.layout ?? old.activeCollectionLayout,
              activeCollectionFilter:
                preferences.filter ?? old.activeCollectionFilter,
              activeCollectionGrouping:
                preferences.grouping ?? old.activeCollectionGrouping,
            }
        );

        queryClient.setQueryData(collectionKeys.tree, (old?: Collection[]) => {
          if (!old) {
            return old;
          }

          const idx = old.findIndex((c) => c.id === id);
          if (idx === -1) {
            return old;
          }

          const oldCollection = old[idx]!;
          const updatedCollection = {
            ...oldCollection,
            layout: preferences.layout ?? oldCollection.layout,
            filter: preferences.filter ?? oldCollection.filter,
            grouping: preferences.grouping ?? oldCollection.grouping,
          };

          return set(lensIndex(idx), updatedCollection, old);
        });
      },
      onSuccess: (_, { id, preferences }) => {
        queryClient.invalidateQueries(preferencesKeys.base);
        queryClient.invalidateQueries(collectionKeys.tree);

        if (preferences.filter) {
          queryClient.invalidateQueries(collectionKeys.lists(id));
        }
      },
    }
  );
};
