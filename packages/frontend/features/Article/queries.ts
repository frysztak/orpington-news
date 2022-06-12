import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getItemDetails, setDateRead, useApi, useHandleError } from '@api';
import { CollectionItemDetails, ID } from '@orpington-news/shared';
import { collectionKeys } from '@features';
import { useActiveCollection } from '@features/Preferences';

export const useArticleDateReadMutation = (collectionId: ID, itemId: ID) => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  const detailKey = collectionKeys.detail(collectionId, itemId);
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
          CollectionItemDetails | undefined
        >(detailKey);
        if (previousDetails) {
          queryClient.setQueryData(detailKey, {
            ...previousDetails,
            dateRead: dateRead ?? undefined,
          });
        }

        return { previousDetails };
      },
      onError: (err, { dateRead }, context) => {
        onError(err);
        queryClient.setQueryData(detailKey, (context as any).previousDetails);
      },
      onSettled: () => {
        queryClient.invalidateQueries(collectionKeys.allForId(collectionId));
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
  collectionId: ID,
  itemId: ID,
  options?: {
    onSuccess: (data: CollectionItemDetails) => void;
  }
) => {
  const api = useApi();
  const { onError } = useHandleError();

  const key = collectionKeys.detail(collectionId, itemId);

  return useQuery(key, () => getItemDetails(api, collectionId!, itemId!), {
    enabled: Boolean(collectionId) && Boolean(itemId),
    retry: false,
    onError,
    onSuccess: options?.onSuccess,
  });
};
