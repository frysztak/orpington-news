import { useMutation, useQueryClient } from 'react-query';
import {
  addCollection,
  editCollection,
  useApi,
  useHandleError,
  verifyFeedUrl,
} from '@api';
import { AddCollectionFormData } from '@components/collection/add';
import {
  defaultRefreshInterval,
  FlatCollection,
  ID,
} from '@orpington-news/shared';
import { collectionKeys, preferencesKeys } from '@features/queryKeys';

export const useVerifyFeedURL = () => {
  const api = useApi();
  const { onError } = useHandleError();

  return useMutation(({ url }: { url: string }) => verifyFeedUrl(api, url), {
    onError,
  });
};

export const useSaveCollection = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const api = useApi();
  const { onError } = useHandleError();

  const queryClient = useQueryClient();

  return useMutation(
    (data: AddCollectionFormData) =>
      addCollection(api, {
        title: data.title,
        url: data.url?.length === 0 ? undefined : data.url,
        description: data.description,
        icon: data.icon,
        parentId: data.parentId,
        refreshInterval: data.refreshInterval ?? defaultRefreshInterval,
      }),
    {
      onError,
      onSuccess: (data: FlatCollection[], formData: AddCollectionFormData) => {
        onSuccess?.();
        queryClient.setQueryData(collectionKeys.tree, data);

        // if collection has a parent, it got auto-expanded on the BE.
        // update preferences to reflect that in UI
        if (formData.parentId) {
          queryClient.invalidateQueries(preferencesKeys.base);
        }
      },
    }
  );
};

export const useEditCollection = ({
  id,
  onSuccess,
}: {
  id: ID;
  onSuccess?: () => void;
}) => {
  const api = useApi();
  const { onError } = useHandleError();

  const queryClient = useQueryClient();

  return useMutation(
    (data: AddCollectionFormData) =>
      editCollection(api, {
        id: id,
        title: data.title,
        url: data.url?.length === 0 ? undefined : data.url,
        description: data.description,
        icon: data.icon,
        parentId: data.parentId,
        refreshInterval: data.refreshInterval ?? defaultRefreshInterval,
      }),
    {
      onError,
      onSuccess: (data: FlatCollection[], formData: AddCollectionFormData) => {
        onSuccess?.();
        queryClient.setQueryData(collectionKeys.tree, data);
        queryClient.invalidateQueries(collectionKeys.allForId(id));

        // if collection has a parent, it got auto-expanded on the BE.
        // update preferences to reflect that in UI
        if (formData.parentId) {
          queryClient.invalidateQueries(preferencesKeys.base);
        }
      },
    }
  );
};
