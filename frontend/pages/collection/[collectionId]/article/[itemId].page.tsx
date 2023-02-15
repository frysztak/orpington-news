import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
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
