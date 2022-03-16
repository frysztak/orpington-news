import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient } from 'react-query';
import { api, getCollections, getItemDetails, getPreferences } from '@api';
import {
  getCookieHeaderFromReq,
  getChakraColorModeCookie,
  isLoginDisabled,
} from '@utils';
import { collectionKeys, preferencesKeys } from '@features/queryKeys';
import { getNumber } from '@utils/router';
import { useArticleDetails } from '@features/Article/queries';

const ItemPage: NextPage = () => {
  const router = useRouter();
  const collectionId = getNumber(router.query?.collectionId);
  const itemId = getNumber(router.query?.itemId);
  const { data: { title } = {} } = useArticleDetails(collectionId!, itemId!);

  return (
    <>
      <Head>
        <title>{title ? `${title} | Orpington News` : 'Orpington News'}</title>
      </Head>
    </>
  );
};

export default ItemPage;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const chakraCookie = getChakraColorModeCookie(req);

  if (!isLoginDisabled()) {
    if (!req.cookies['sessionId']) {
      return {
        props: {
          chakraCookie,
        },
        redirect: {
          destination: '/login',
        },
      };
    }
  }

  const collectionId = getNumber(query?.collectionId);
  const itemId = getNumber(query?.itemId);
  if (collectionId === undefined || itemId === undefined) {
    return { props: { chakraCookie } };
  }

  const apiWithHeaders = api.headers(getCookieHeaderFromReq(req));
  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery(collectionKeys.tree, () =>
      getCollections(apiWithHeaders)
    ),
    queryClient.prefetchQuery(collectionKeys.detail(collectionId, itemId), () =>
      getItemDetails(apiWithHeaders, collectionId, itemId)
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
