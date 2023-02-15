import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  moveCollection,
  MoveCollectionBody,
  useApi,
  useHandleError,
} from '@api';
import { Collection } from '@shared';
import { collectionKeys } from '@features/queryKeys';

export const useMoveCollection = () => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  return useMutation((body: MoveCollectionBody) => moveCollection(api, body), {
    onError,
    onSuccess: (Collections: Collection[]) => {
      queryClient.setQueryData(collectionKeys.tree, Collections);
    },
  });
};
