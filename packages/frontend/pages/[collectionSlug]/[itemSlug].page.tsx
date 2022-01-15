import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient } from 'react-query';
import { ConnectedPanes } from '@pages/ConnectedPanes';
import { isLoginDisabled } from '@orpington-news/shared';
import { api, getItemDetails } from '@api';
import { getSessionIdFromRequest } from '@utils';

const getString = (x: undefined | unknown): string | undefined =>
  typeof x === 'string' ? x : undefined;

const ItemPage: NextPage = () => {
  const router = useRouter();
  const collectionSlug = getString(router.query?.collectionSlug);
  const itemSlug = getString(router.query?.itemSlug);

  return (
    <>
      <Head>
        <title>Orpington News</title>
      </Head>

      {collectionSlug && itemSlug && (
        <ConnectedPanes collectionSlug={collectionSlug} itemSlug={itemSlug} />
      )}
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

  const collectionSlug = getString(query?.collectionSlug);
  const itemSlug = getString(query?.itemSlug);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    ['itemDetails', { collectionSlug, itemSlug }],
    () =>
      getItemDetails(
        api.headers(getSessionIdFromRequest(req)),
        collectionSlug!,
        itemSlug!
      )
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
