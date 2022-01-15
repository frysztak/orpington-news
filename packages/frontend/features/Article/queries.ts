import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getItemDetails, setDateRead, useApi, useHandleError } from '@api';
import { CollectionItemDetails, ID } from '@orpington-news/shared';
import { collectionKeys } from '@features';

export const useArticleDateReadMutation = (
  collectionId: ID,
  itemSlug: string
) => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  const detailKey = collectionKeys.detail(collectionId, itemSlug);

  return useMutation(
    ({ id, dateRead }: { id: string; dateRead: number | null }) =>
      setDateRead(api, id, dateRead),
    {
      onMutate: async ({ id, dateRead }) => {
        await queryClient.cancelQueries(detailKey);
        const previousDetails = queryClient.getQueryData<
          CollectionItemDetails | undefined
        >(detailKey);
        queryClient.setQueryData<CollectionItemDetails | undefined>(
          detailKey,
          (oldDetails) =>
            oldDetails && {
              ...oldDetails,
              dateRead: dateRead ?? undefined,
            }
        );
        return { previousDetails };
      },
      onError: (err, { id, dateRead }, context) => {
        onError(err);
        queryClient.setQueryData(detailKey, (context as any).previousDetails);
      },
      onSettled: () => {
        queryClient.invalidateQueries(collectionKeys.allForId(collectionId));
        queryClient.invalidateQueries(collectionKeys.tree);
        queryClient.invalidateQueries(collectionKeys.home);
      },
      onSuccess: () => {
        // TODO: toast
      },
    }
  );
};

export const useArticleDetails = (collectionId: ID, itemSlug: string) => {
  const api = useApi();
  const { onError } = useHandleError();

  const key = collectionKeys.detail(collectionId, itemSlug);

  return useQuery(key, () => getItemDetails(api, collectionId!, itemSlug!), {
    enabled: Boolean(collectionId) && Boolean(itemSlug),
    onError,
  });
};
