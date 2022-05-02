import type { GetServerSideProps } from 'next';
import type { Wretcher } from 'wretch';
import { dehydrate, QueryClient, QueryKey } from 'react-query';
import { getCollections, getPreferences, getUser, ssrApi } from '@api';
import { getChakraColorModeCookie, getCookieHeaderFromReq } from '@utils';
import { collectionKeys, preferencesKeys, userKeys } from '@features/queryKeys';
import { Preferences } from '@orpington-news/shared';
import { collectionsItemsQueryFn } from '@features/Collections/queries';

type QueryData = [QueryKey, (api: Wretcher) => Promise<unknown>];
export interface GetSSParams {
  /**
   * If `true`, redirects to login page when no session cookie is found.
   * Defaults to `true`.
   */
  requireAuthorization?: boolean;
  queriesToFetch?: Array<QueryData>;
  postFetchCallback?: (
    queryClient: QueryClient,
    api: Wretcher
  ) => Promise<void>;
}

export const commonQueries: Array<QueryData> = [
  [userKeys.info, getUser],
  [collectionKeys.tree, getCollections],
  [preferencesKeys.base, getPreferences],
];

export const fetchCurrentCollection = async (
  queryClient: QueryClient,
  api: Wretcher
) => {
  const preferences = queryClient.getQueryData<Preferences>(
    preferencesKeys.base
  );
  if (preferences) {
    const activeCollectionId =
      preferences.activeView === 'home'
        ? 'home'
        : preferences.activeCollectionId;
    await queryClient.prefetchInfiniteQuery(
      collectionKeys.list(activeCollectionId),
      collectionsItemsQueryFn(api, activeCollectionId)
    );

    // https://github.com/tannerlinsley/react-query/issues/1458#issuecomment-953830227
    queryClient.setQueryData(
      collectionKeys.list(activeCollectionId),
      (data: any) => ({
        ...data,
        pageParams: [],
      })
    );
  }
};

export const getSSProps =
  (params: GetSSParams): GetServerSideProps =>
  async ({ req }) => {
    const {
      requireAuthorization = true,
      queriesToFetch,
      postFetchCallback,
    } = params;

    if (requireAuthorization && !req.cookies['sessionId']) {
      return {
        props: { chakraCookie: getChakraColorModeCookie(req) },
        redirect: {
          destination: '/login',
        },
      };
    }

    const apiWithHeaders = ssrApi().headers(getCookieHeaderFromReq(req));
    const queryClient = new QueryClient();

    if (queriesToFetch?.length) {
      await Promise.all(
        queriesToFetch.map(([queryKey, queryFn]) =>
          queryClient.prefetchQuery(queryKey, () => queryFn(apiWithHeaders))
        )
      );
    }
    await postFetchCallback?.(queryClient, apiWithHeaders);

    return {
      props: {
        chakraCookie: getChakraColorModeCookie(req),
        dehydratedState: dehydrate(queryClient),
      },
    };
  };
