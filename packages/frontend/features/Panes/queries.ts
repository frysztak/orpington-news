import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  addCollection,
  deleteCollection,
  editCollection,
  useApi,
  useHandleError,
  verifyFeedUrl,
} from '@api';
import type { AddCollectionFormData } from '@components/collection/add';
import { useSetActiveCollection } from '@features/Preferences';
import { collectionKeys, preferencesKeys } from '@features/queryKeys';
import { useGetUserHomeId } from '@features/Auth';
import { defaultRefreshInterval, Collection, ID } from '@orpington-news/shared';

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
      onSuccess: (data: Collection[], formData: AddCollectionFormData) => {
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
      onSuccess: (data: Collection[], formData: AddCollectionFormData) => {
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

export const useDeleteCollection = ({
  onSuccess,
}: {
  onSuccess?: (ids: ID[]) => void;
}) => {
  const api = useApi();
  const router = useRouter();
  const { onError } = useHandleError();

  const queryClient = useQueryClient();
  const { setHomeCollection } = useSetActiveCollection();
  const homeId = useGetUserHomeId();

  return useMutation(({ id }: { id: ID }) => deleteCollection(api, id), {
    onError,
    onSuccess: ({ ids, navigateHome }) => {
      onSuccess?.(ids);
      queryClient.invalidateQueries({ queryKey: collectionKeys.tree });
      if (homeId !== undefined) {
        queryClient.invalidateQueries(collectionKeys.lists(homeId));
      }

      if (navigateHome) {
        router.push('/', '/', { shallow: true }).then(() => {
          setHomeCollection();
          queryClient.invalidateQueries(preferencesKeys.base);
        });
      }
    },
  });
};
