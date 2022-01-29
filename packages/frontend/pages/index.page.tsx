import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { dehydrate, QueryClient } from 'react-query';
import { api, getCollections } from '@api';
import { getSessionIdFromRequest, isLoginDisabled } from '@utils';
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
  const cookies = req.headers.cookie ?? '';
  if (!isLoginDisabled()) {
    if (!req.cookies['sessionId']) {
      return {
        props: { cookies },
        redirect: {
          destination: '/login',
        },
      };
    }
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(collectionKeys.tree, () =>
    getCollections(api.headers(getSessionIdFromRequest(req)))
  );

  return {
    props: {
      cookies,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default Home;
