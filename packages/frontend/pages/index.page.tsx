import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { dehydrate, QueryClient } from 'react-query';
import { getCollections, getPreferences, ssrApi } from '@api';
import {
  getChakraColorModeCookie,
  getCookieHeaderFromReq,
  isLoginDisabled,
} from '@utils';
import { collectionKeys, preferencesKeys } from '@features';

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
  if (!isLoginDisabled()) {
    if (!req.cookies['sessionId']) {
      return {
        props: { chakraCookie },
        redirect: {
          destination: '/login',
        },
      };
    }
  }

  const apiWithHeaders = ssrApi.headers(getCookieHeaderFromReq(req));
  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery(collectionKeys.tree, () =>
      getCollections(apiWithHeaders)
    ),
    queryClient.prefetchQuery(preferencesKeys.base, () =>
      getPreferences(apiWithHeaders)
    ),
  ]);

  return {
    props: {
      chakraCookie,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default Home;
