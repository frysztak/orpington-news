import { useQueryClient, useMutation } from 'react-query';
import { useApi, useHandleError, deleteCollection } from '@api';
import { collectionKeys, preferencesKeys } from '@features';
import { useSetActiveCollection } from '@features/Preferences';
import type { ID } from '@orpington-news/shared';

export const useDeleteCollection = ({
  onSuccess,
}: {
  onSuccess?: (ids: ID[]) => void;
}) => {
  const api = useApi();
  const { onError } = useHandleError();

  const queryClient = useQueryClient();
  const { setActiveCollection } = useSetActiveCollection();

  return useMutation(({ id }: { id: ID }) => deleteCollection(api, id), {
    onError,
    onSuccess: ({ ids, navigateHome }) => {
      onSuccess?.(ids);
      queryClient.invalidateQueries(collectionKeys.tree);

      if (navigateHome) {
        setActiveCollection('home');
        queryClient.invalidateQueries(preferencesKeys.base);
      }
    },
  });
};
