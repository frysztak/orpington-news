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
import { useGetUserHomeId } from '@features/Auth';
import {
  CollectionItem,
  Collection,
  ID,
  Preferences,
  CollectionFilter,
  defaultCollectionFilter,
  CollectionGrouping,
  defaultCollectionGrouping,
  defaultPageSize,
  CollectionSortBy,
  defaultCollectionSortBy,
} from '@shared';
import { mutatePageData } from '@utils';
import { useCollectionsContext } from './CollectionsContext';
import {
  getGroupCounts,
  getGroupNames,
  groupByCollection,
  groupByDate,
} from './helpers';

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

export const useCollectionById = (collectionId?: ID | null) => {
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
  (
    api: Wretch,
    collectionId: ID,
    filter: CollectionFilter,
    grouping: CollectionGrouping,
    sortBy: CollectionSortBy
  ) =>
  ({ pageParam = 0, signal }: QueryFunctionContext) => {
    return getCollectionItems(
      api,
      signal,
      collectionId,
      pageParam,
      filter,
      grouping,
      sortBy
    ).then((items) => ({
      items,
      pageParam,
    }));
  };

export const useCollectionItems = (
  collectionId?: ID,
  filter: CollectionFilter = defaultCollectionFilter,
  grouping: CollectionGrouping = defaultCollectionGrouping,
  sortBy: CollectionSortBy = defaultCollectionSortBy
) => {
  const api = useApi();
  const { onError } = useHandleError();

  const { data, ...rest } = useInfiniteQuery(
    collectionKeys.list(collectionId!, filter, grouping, sortBy),
    collectionsItemsQueryFn(api, collectionId!, filter, grouping, sortBy),
    {
      enabled: collectionId !== undefined,
      getNextPageParam: (lastPage) =>
        lastPage.items.length < defaultPageSize
          ? undefined
          : lastPage.pageParam + 1,
      onError,
    }
  );

  const allItems = useMemo(() => {
    return data?.pages?.flatMap((page) => [...page.items]) || [];
  }, [data]);

  const { groupCounts, groupNames } = useMemo(() => {
    if (grouping === 'none') {
      return {};
    }

    const grouped =
      grouping === 'date' ? groupByDate(allItems) : groupByCollection(allItems);
    return {
      groupCounts: getGroupCounts(grouped),
      groupNames: getGroupNames(grouped),
    };
  }, [allItems, grouping]);

  return { ...rest, data, allItems, groupCounts, groupNames };
};

export const useMarkCollectionAsRead = () => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();
  const { beingMarkedAsRead } = useCollectionsContext();
  const homeId = useGetUserHomeId();

  return useMutation(({ id }: { id: ID }) => markCollectionAsRead(api, id), {
    onMutate: ({ id }) => {
      beingMarkedAsRead.add([id]);
    },
    onError,
    onSuccess: ({ ids, collections, timestamp }) => {
      queryClient.setQueryData(collectionKeys.tree, collections);

      for (const id of ids) {
        queryClient.setQueriesData(
          collectionKeys.lists(id),
          mutatePageData<CollectionItem>((item) => ({
            ...item,
            dateRead: timestamp,
          }))
        );

        queryClient.invalidateQueries(collectionKeys.allForId(id));
      }

      if (homeId !== undefined) {
        queryClient.setQueriesData(
          collectionKeys.lists(homeId),
          mutatePageData<CollectionItem>((item) =>
            ids.includes(item.collection.id)
              ? { ...item, dateRead: timestamp }
              : item
          )
        );
        queryClient.invalidateQueries(collectionKeys.allForId(homeId));
      }
      queryClient.invalidateQueries(collectionKeys.tree);
    },
    onSettled: (_, __, { id }) => {
      beingMarkedAsRead.remove([id]);
    },
  });
};

export const useRefreshCollection = () => {
  const api = useApi();
  const { onError } = useHandleError();

  return useMutation(({ id }: { id: ID }) => refreshCollection(api, id), {
    onError,
  });
};

type CollectionPreferences = Pick<
  Collection,
  'layout' | 'filter' | 'grouping' | 'sortBy'
>;

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
              activeCollectionSortBy:
                preferences.sortBy ?? old.activeCollectionSortBy,
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
            sortBy: preferences.sortBy ?? oldCollection.sortBy,
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
