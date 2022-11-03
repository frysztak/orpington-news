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
import type {
  CollectionFilter,
  CollectionGrouping,
  CollectionLayout,
  ID,
  Preferences,
  ViewPreferences,
} from '@orpington-news/shared';

export const useGetPreferences = <TSelectedData = Preferences>(opts?: {
  select?: (data: Preferences) => TSelectedData;
}) => {
  const api = useApi();
  const { onError } = useHandleError();

  return useQuery(
    preferencesKeys.base,
    ({ signal }) => getPreferences(api, signal),
    {
      onError,
      select: opts?.select,
    }
  );
};

export const usePrefetchPreferences = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  if (queryClient.getQueryData(preferencesKeys.base)) {
    return;
  }

  queryClient.prefetchQuery(preferencesKeys.base, ({ signal }) =>
    getPreferences(api, signal)
  );
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
      queryClient.setQueryData(
        key,
        (old?: Preferences) =>
          old && {
            ...old,
            expandedCollectionIds: [...old.expandedCollectionIds, id],
          }
      );

      return { previousPrefs };
    },
    onError: (err, { id }, context: any) => {
      onError(err);
      queryClient.setQueryData(preferencesKeys.base, context.previousPrefs);
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
      queryClient.setQueryData(
        key,
        (old?: Preferences) =>
          old && {
            ...old,
            expandedCollectionIds: without([id], old.expandedCollectionIds),
          }
      );

      return { previousPrefs };
    },
    onError: (err, { id }, context: any) => {
      onError(err);
      queryClient.setQueryData(preferencesKeys.base, context.previousPrefs);
    },
  });
};

export const useSetActiveView = () => {
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  return useMutation(
    (
      activeView: ViewPreferences & {
        activeCollectionTitle: string;
        activeCollectionLayout?: CollectionLayout;
        activeCollectionFilter?: CollectionFilter;
        activeCollectionGrouping?: CollectionGrouping;
      }
    ) => setActiveView(api, activeView),
    {
      onMutate: async (activeView) => {
        const key = preferencesKeys.base;
        await queryClient.cancelQueries(key);
        const previousPrefs = queryClient.getQueryData<Preferences>(key);
        queryClient.setQueryData(
          key,
          (old?: Preferences) =>
            old && {
              ...old,
              ...activeView,
            }
        );

        return { previousPrefs };
      },
      onError: (err, _, context: any) => {
        onError(err);
        queryClient.setQueryData(preferencesKeys.base, context.previousPrefs);
      },
    }
  );
};
