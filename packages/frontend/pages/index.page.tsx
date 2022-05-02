import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { commonQueries, fetchCurrentCollection, getSSProps } from './ssrProps';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Orpington News</title>
      </Head>
    </>
  );
};

export const getServerSideProps = getSSProps({
  queriesToFetch: commonQueries,
  postFetchCallback: fetchCurrentCollection,
});

export default Home;
