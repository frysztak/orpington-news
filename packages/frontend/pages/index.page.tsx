import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { dehydrate, QueryClient } from 'react-query';
import { isLoginDisabled } from '@orpington-news/shared';
import { ConnectedPanes } from './ConnectedPanes';
import { api, getCollections } from '@api';
import { getSessionIdFromRequest } from '@utils';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Orpington News</title>
      </Head>

      <ConnectedPanes />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!isLoginDisabled()) {
    if (!req.cookies['sessionId']) {
      return {
        props: {},
        redirect: {
          destination: '/login',
        },
      };
    }
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(['collections'], () =>
    getCollections(api.headers(getSessionIdFromRequest(req)))
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default Home;
