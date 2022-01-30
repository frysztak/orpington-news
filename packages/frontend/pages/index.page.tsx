import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { dehydrate, QueryClient } from 'react-query';
import { api, getCollections } from '@api';
import {
  getChakraColorModeCookie,
  getCookieHeaderFromReq,
  isLoginDisabled,
} from '@utils';
import { collectionKeys } from '@features';

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

  const apiWithHeaders = api.headers(getCookieHeaderFromReq(req));
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(collectionKeys.tree, () =>
    getCollections(apiWithHeaders)
  );

  return {
    props: {
      chakraCookie,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default Home;
