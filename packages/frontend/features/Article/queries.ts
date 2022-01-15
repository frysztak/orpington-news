import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getItemDetails, setDateRead, useApi, useHandleError } from '@api';
import { CollectionItemDetails } from '@orpington-news/shared';
import { collectionKeys } from '@features';

export const useArticleDateReadMutation = (
  collectionSlug: string,
  itemSlug: string
) => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  const detailKey = collectionKeys.detail(collectionSlug, itemSlug);

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
        queryClient.invalidateQueries(detailKey);
      },
      onSuccess: () => {
        queryClient.invalidateQueries('collections');
        queryClient.invalidateQueries('collectionItems');
      },
    }
  );
};

export const useArticleDetails = (collectionSlug: string, itemSlug: string) => {
  const api = useApi();
  const { onError } = useHandleError();

  const key = collectionKeys.detail(collectionSlug, itemSlug);

  return useQuery(key, () => getItemDetails(api, collectionSlug!, itemSlug!), {
    enabled: Boolean(collectionSlug) && Boolean(itemSlug),
    onError,
  });
};
