import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { without } from 'rambda';
import {
  collapseCollection,
  expandCollection,
  getPreferences,
  setActiveView,
  useApi,
  useHandleError,
} from '@api';
import { preferencesKeys } from '@features/queryKeys';
import type { ID, Preferences, ViewPreference } from '@orpington-news/shared';

export const useGetPreferences = <TSelectedData = Preferences>(opts?: {
  select?: (data: Preferences) => TSelectedData;
}) => {
  const api = useApi();
  const { onError } = useHandleError();

  return useQuery(preferencesKeys.base, () => getPreferences(api), {
    onError,
    select: opts?.select,
  });
};

export const useExpandedCollections = () => {
  return useGetPreferences({
    select: (preferences) => preferences.expandedCollectionIds,
  });
};

export const useExpandCollection = () => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  return useMutation(({ id }: { id: ID }) => expandCollection(api, id), {
    onMutate: async ({ id }) => {
      const key = preferencesKeys.base;
      await queryClient.cancelQueries(key);
      const previousPrefs = queryClient.getQueryData<Preferences>(key);
      if (previousPrefs) {
        queryClient.setQueryData(key, {
          ...previousPrefs,
          expandedCollectionIds: [...previousPrefs.expandedCollectionIds, id],
        });
      }

      return { previousPrefs };
    },
    onError: (err, { id }, context: any) => {
      onError(err);
      queryClient.setQueryData(preferencesKeys.base, context.previousPrefs);
    },
    onSuccess: (prefs: Preferences) => {
      queryClient.setQueryData(preferencesKeys.base, prefs);
    },
  });
};

export const useCollapseCollection = () => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  return useMutation(({ id }: { id: ID }) => collapseCollection(api, id), {
    onMutate: async ({ id }) => {
      const key = preferencesKeys.base;
      await queryClient.cancelQueries(key);
      const previousPrefs = queryClient.getQueryData<Preferences>(key);
      if (previousPrefs) {
        queryClient.setQueryData(key, {
          ...previousPrefs,
          expandedCollectionIds: without(
            [id],
            previousPrefs.expandedCollectionIds
          ),
        });
      }

      return { previousPrefs };
    },
    onError: (err, { id }, context: any) => {
      onError(err);
      queryClient.setQueryData(preferencesKeys.base, context.previousPrefs);
    },
    onSuccess: (prefs: Preferences) => {
      queryClient.setQueryData(preferencesKeys.base, prefs);
    },
  });
};

export const useSetActiveView = () => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  return useMutation(
    (activeView: ViewPreference) => setActiveView(api, activeView),
    {
      onMutate: async (activeView) => {
        const key = preferencesKeys.base;
        await queryClient.cancelQueries(key);
        const previousPrefs = queryClient.getQueryData<Preferences>(key);
        if (previousPrefs) {
          queryClient.setQueryData(key, {
            ...previousPrefs,
            ...activeView,
          });
        }

        return { previousPrefs };
      },
      onError: (err, _, context: any) => {
        onError(err);
        queryClient.setQueryData(preferencesKeys.base, context.previousPrefs);
      },
      onSuccess: (prefs: Preferences) => {
        queryClient.setQueryData(preferencesKeys.base, prefs);
      },
    }
  );
};
