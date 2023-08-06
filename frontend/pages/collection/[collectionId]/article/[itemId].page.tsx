import React from 'react';
import Head from 'next/head';
import { NextPageWithLayout } from '@pages/types';
import { Panes } from '@features/Panes';
import { usePageTitle } from '@pages/usePageTitle';

const StandaloneItemPage: NextPageWithLayout = () => {
  const title = usePageTitle();

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
    </>
  );
};

StandaloneItemPage.getLayout = (page) => {
  return <Panes standaloneArticle>{page}</Panes>;
};

export default StandaloneItemPage;
