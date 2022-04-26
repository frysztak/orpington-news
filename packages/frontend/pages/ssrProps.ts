import type { GetServerSideProps } from 'next';
import { getChakraColorModeCookie } from '@utils';

export const commonGetServerSideProps: GetServerSideProps = async ({ req }) => {
  const chakraCookie = getChakraColorModeCookie(req);
  if (!req.cookies['sessionId']) {
    return {
      props: { chakraCookie },
      redirect: {
        destination: '/login',
      },
    };
  }

  return {
    props: {
      chakraCookie,
    },
  };
};
