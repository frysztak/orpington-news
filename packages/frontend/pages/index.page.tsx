import React from 'react';
import { Box } from '@chakra-ui/react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { isLoginDisabled } from '@orpington-news/shared';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Orpington News</title>
      </Head>
      <Box>Hello</Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (isLoginDisabled()) {
    return { props: {} };
  }

  const {
    req: { cookies },
  } = context;
  if (!cookies['sessionId']) {
    return {
      props: {},
      redirect: {
        destination: '/login',
      },
    };
  }
  return { props: {} };
};

export default Home;
