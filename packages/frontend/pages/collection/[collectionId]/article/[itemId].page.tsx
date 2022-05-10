import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getItemDetails } from '@api';
import { getChakraColorModeCookie } from '@utils';
import { collectionKeys } from '@features/queryKeys';
import { getNumber } from '@utils/router';
import { useArticleDetails } from '@features/Article/queries';
import { commonQueries, getSSProps } from '@pages/ssrProps';

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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req, query } = ctx;
  const collectionId = getNumber(query?.collectionId);
  const itemId = getNumber(query?.itemId);
  if (collectionId === undefined || itemId === undefined) {
    return { props: { chakraCookie: getChakraColorModeCookie(req) } };
  }

  return await getSSProps({
    queriesToFetch: [
      ...commonQueries,
      [
        collectionKeys.detail(collectionId, itemId),
        (api) => getItemDetails(api, collectionId, itemId),
      ],
    ],
  })(ctx);
};
