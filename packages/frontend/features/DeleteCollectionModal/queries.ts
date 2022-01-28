import { useQueryClient, useMutation } from 'react-query';
import { useApi, useHandleError, deleteCollection } from '@api';
import { collectionKeys } from '@features';
import { ID } from '@orpington-news/shared';

export const useDeleteCollection = ({
  onSuccess,
}: {
  onSuccess?: (ids: ID[]) => void;
}) => {
  const api = useApi();
  const { onError } = useHandleError();

  const queryClient = useQueryClient();

  return useMutation(({ id }: { id: ID }) => deleteCollection(api, id), {
    onError,
    onSuccess: ({ ids }) => {
      onSuccess?.(ids);
      queryClient.invalidateQueries(collectionKeys.tree);
    },
  });
};
