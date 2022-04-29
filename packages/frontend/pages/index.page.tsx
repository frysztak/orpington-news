import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { dehydrate, QueryClient } from 'react-query';
import { getCollections, getPreferences, getUser, ssrApi } from '@api';
import { getChakraColorModeCookie, getCookieHeaderFromReq } from '@utils';
import { collectionKeys, preferencesKeys, userKeys } from '@features';
import { collectionsItemsQueryFn } from '@features/Collections';
import { Preferences } from '@orpington-news/shared';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Orpington News</title>
      </Head>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const chakraCookie = getChakraColorModeCookie(req);
  if (!req.cookies['sessionId']) {
    return {
      props: { chakraCookie },
      redirect: {
        destination: '/login',
      },
    };
  }

  const apiWithHeaders = ssrApi().headers(getCookieHeaderFromReq(req));
  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery(userKeys.info, () => getUser(apiWithHeaders)),
    queryClient.prefetchQuery(collectionKeys.tree, () =>
      getCollections(apiWithHeaders)
    ),
    queryClient.prefetchQuery(preferencesKeys.base, () =>
      getPreferences(apiWithHeaders)
    ),
  ]);
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
      collectionsItemsQueryFn(apiWithHeaders, activeCollectionId)
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

  return {
    props: {
      chakraCookie,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default Home;
