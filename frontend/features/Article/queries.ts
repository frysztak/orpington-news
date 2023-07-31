import {
  InfiniteData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { getItemDetails, setDateRead, useApi, useHandleError } from '@api';
import { CollectionItem, ID } from '@shared';
import { collectionKeys } from '@features';
import { useActiveCollection } from '@features/Preferences';
import { mutatePageData } from '@utils';
import { useCollectionItems } from '@features/Collections/queries';

export const useArticleDateReadMutation = (collectionId?: ID, itemId?: ID) => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  const detailKey = collectionKeys.detail(collectionId!, itemId!);
  const activeCollection = useActiveCollection();

  return useMutation(
    ({
      collectionId,
      itemId,
      dateRead,
    }: {
      collectionId: ID;
      itemId: ID;
      dateRead: number | null;
    }) => setDateRead(api, collectionId, itemId, dateRead),
    {
      onMutate: async ({ dateRead }) => {
        // Optimistically update article
        await queryClient.cancelQueries(detailKey);
        const previousDetails = queryClient.getQueryData<
          CollectionItem | undefined
        >(detailKey);
        if (previousDetails) {
          queryClient.setQueryData(detailKey, {
            ...previousDetails,
            dateRead: dateRead ?? undefined,
          });
        }

        // Optimistically update active list
        const activeListKey =
          activeCollection && collectionKeys.lists(activeCollection.id);
        const previousList =
          activeListKey && queryClient.getQueriesData(activeListKey);

        if (activeCollection) {
          queryClient.setQueriesData(
            {
              queryKey: collectionKeys.lists(activeCollection.id),
            },
            mutatePageData<CollectionItem>((item) =>
              item.id === itemId
                ? {
                    ...item,
                    dateRead: dateRead ?? undefined,
                  }
                : item
            )
          );
        }

        return { previousDetails, activeListKey, previousList };
      },
      onError: (err, { dateRead }, context) => {
        onError(err);
        if (context) {
          queryClient.setQueryData(detailKey, context.previousDetails);
        }
        if (context?.activeListKey) {
          queryClient.setQueryData(context.activeListKey, context.previousList);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(collectionKeys.tree);
      },
    }
  );
};

export const useArticleDetails = (
  collectionId?: ID,
  itemId?: ID,
  options?: {
    onSuccess: (data: CollectionItem) => void;
  }
) => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  const key = collectionKeys.detail(collectionId!, itemId!);

  return useQuery(key, () => getItemDetails(api, collectionId!, itemId!), {
    enabled: Boolean(collectionId) && Boolean(itemId),
    retry: false,
    onError,
    onSuccess: (data: CollectionItem) => {
      const { nextId } = data;

      // prefetch next article
      if (nextId !== null) {
        const key = collectionKeys.detail(collectionId!, nextId);
        queryClient.prefetchQuery(key, () =>
          getItemDetails(api, collectionId!, nextId)
        );
      }

      options?.onSuccess?.(data);
    },
    initialData: () => {
      const queries = queryClient.getQueriesData<
        InfiniteData<{ items: CollectionItem[] }>
      >(collectionKeys.lists(collectionId!));
      const query = queries.find(([queryKey, queryData]) => Boolean(queryData));
      if (!query) {
        return;
      }

      const queryData = query[1]!;
      for (const page of queryData.pages) {
        for (const item of page.items) {
          if (item.id === itemId) {
            return item;
          }
        }
      }
    },
  });
};

const NO_ADJACENT_ARTICLES = {
  nextArticleId: undefined,
  previousArticleId: undefined,
};

export const useAdjacentArticles = (
  articleId?: ID
): { previousArticleId?: ID; nextArticleId?: ID } => {
  const activeCollection = useActiveCollection();

  const { fetchNextPage, hasNextPage, allItems } = useCollectionItems(
    activeCollection?.id,
    activeCollection?.filter,
    activeCollection?.grouping,
    activeCollection?.sortBy
  );

  if (articleId === undefined) {
    return NO_ADJACENT_ARTICLES;
  }

  const idx = allItems.findIndex(({ id }) => id === articleId);

  if (idx === -1) {
    return NO_ADJACENT_ARTICLES;
  }

  const previousArticleId = allItems[idx - 1]?.id;
  const nextArticleId = allItems[idx + 1]?.id;

  if (allItems.length - idx <= 4 && hasNextPage) {
    fetchNextPage();
  }

  return { previousArticleId, nextArticleId };
};
