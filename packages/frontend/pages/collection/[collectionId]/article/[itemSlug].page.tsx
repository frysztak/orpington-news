import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { dehydrate, QueryClient } from 'react-query';
import { isLoginDisabled } from '@orpington-news/shared';
import { api, getItemDetails } from '@api';
import { getSessionIdFromRequest } from '@utils';
import { collectionKeys } from '@features/queryKeys';
import { getNumber, getString } from '@utils/router';

const ItemPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Orpington News</title>
      </Head>
    </>
  );
};

export default ItemPage;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
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

  const collectionId = getNumber(query?.collectionId);
  const itemSlug = getString(query?.itemSlug);
  if (collectionId === undefined || itemSlug === undefined) {
    return { props: {} };
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    collectionKeys.detail(collectionId, itemSlug),
    () =>
      getItemDetails(
        api.headers(getSessionIdFromRequest(req)),
        collectionId,
        itemSlug
      )
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
