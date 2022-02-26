import type { GetServerSideProps } from 'next';
import { getChakraColorModeCookie, isLoginDisabled } from '@utils';

export const commonGetServerSideProps: GetServerSideProps = async ({ req }) => {
  const chakraCookie = getChakraColorModeCookie(req);
  if (!isLoginDisabled()) {
    if (!req.cookies['sessionId']) {
      return {
        props: { chakraCookie },
        redirect: {
          destination: '/login',
        },
      };
    }
  }

  return {
    props: {
      chakraCookie,
    },
  };
};
