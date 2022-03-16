import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getItemDetails, setDateRead, useApi, useHandleError } from '@api';
import { CollectionItemDetails, ID } from '@orpington-news/shared';
import { collectionKeys } from '@features';
import { useActiveCollection } from '@features/Preferences';

export const useArticleDateReadMutation = (
  collectionId: ID,
  itemSerialId: ID
) => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  const detailKey = collectionKeys.detail(collectionId, itemSerialId);
  const { activeCollection } = useActiveCollection();

  return useMutation(
    ({ id, dateRead }: { id: ID; dateRead: number | null }) =>
      setDateRead(api, id, dateRead),
    {
      onMutate: async ({ id, dateRead }) => {
        // Optimistically update article
        await queryClient.cancelQueries(detailKey);
        const previousDetails =
          queryClient.getQueryData<CollectionItemDetails | undefined>(
            detailKey
          );
        if (previousDetails) {
          queryClient.setQueryData(detailKey, {
            ...previousDetails,
            dateRead: dateRead ?? undefined,
          });
        }

        return { previousDetails };
      },
      onError: (err, { id, dateRead }, context) => {
        onError(err);
        queryClient.setQueryData(detailKey, (context as any).previousDetails);
      },
      onSettled: () => {
        queryClient.invalidateQueries(collectionKeys.allForId(collectionId));
        queryClient.invalidateQueries(
          collectionKeys.allForId(activeCollection.id)
        );
        queryClient.invalidateQueries(collectionKeys.tree);
      },
    }
  );
};

export const useArticleDetails = (collectionId: ID, itemSerialId: ID) => {
  const api = useApi();
  const { onError } = useHandleError();

  const key = collectionKeys.detail(collectionId, itemSerialId);

  return useQuery(
    key,
    () => getItemDetails(api, collectionId!, itemSerialId!),
    {
      enabled: Boolean(collectionId) && Boolean(itemSerialId),
      retry: false,
      onError,
    }
  );
};
