import type { GetServerSideProps } from 'next';
import type { Wretcher } from 'wretch';
import { dehydrate, QueryClient, QueryKey } from 'react-query';
import { getCollections, getPreferences, getUser, ssrApi } from '@api';
import { getCookieHeaderFromReq } from '@utils';
import { collectionKeys, preferencesKeys, userKeys } from '@features/queryKeys';
import { Preferences } from '@orpington-news/shared';
import { collectionsItemsQueryFn } from '@features/Collections/queries';
import { STORAGE_KEY } from '@chakra-ui/react';

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

const parseIntCookie = (
  cookies: Record<string, string>,
  key: string
): number | null => (cookies[key] && parseInt(cookies[key])) || null;

const parseStringCookie = (
  cookies: Record<string, string>,
  key: string
): string | null => {
  const value = cookies[key];
  if (!value) {
    return null;
  }

  try {
    return decodeURI(cookies[key]).replaceAll('"', '');
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSSProps =
  (params: GetSSParams): GetServerSideProps =>
  async (ctx) => {
    const { req } = ctx;
    const cookies = req.cookies;
    const {
      requireAuthorization = true,
      queriesToFetch,
      postFetchCallback,
    } = params;

    const cookiesToPass = {
      chakraCookie: cookies[STORAGE_KEY]
        ? `${STORAGE_KEY}=${cookies[STORAGE_KEY]}`
        : '',
      // @ts-ignore
      sidebarWidth: parseIntCookie(cookies, 'sidebarWidth'),
      // @ts-ignore
      collectionItemsWidth: parseIntCookie(cookies, 'collectionItemsWidth'),
      // @ts-ignore
      articleWidth: parseStringCookie(cookies, 'articleWidth'),
    };

    if (requireAuthorization && !cookies['sessionId']) {
      return {
        props: { ...cookiesToPass },
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
          queryClient.prefetchQuery(queryKey, () => queryFn(apiWithHeaders), {
            staleTime: 5e3,
          })
        )
      );
    }
    await postFetchCallback?.(queryClient, apiWithHeaders);

    return {
      props: {
        ...cookiesToPass,
        dehydratedState: dehydrate(queryClient),
      },
    };
  };
