import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getItemDetails, setDateRead, useApi, useHandleError } from '@api';
import { CollectionItem, ID } from '@orpington-news/shared';
import { collectionKeys } from '@features';
import { useActiveCollection } from '@features/Preferences';
import { mutatePageData } from '@utils';

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
          activeCollection && collectionKeys.list(activeCollection.id);
        const previousList =
          activeListKey && queryClient.getQueryData(activeListKey);

        if (activeCollection) {
          queryClient.setQueryData(
            collectionKeys.list(activeCollection.id),
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
        queryClient.invalidateQueries(collectionKeys.allForId(collectionId!));
        if (activeCollection) {
          queryClient.invalidateQueries(
            collectionKeys.allForId(activeCollection.id)
          );
        }
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
    onSuccess: (data) => {
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
  });
};
