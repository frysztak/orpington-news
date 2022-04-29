import type { GetServerSideProps } from 'next';
import type { NextPageWithLayout } from '@pages/types';

const Page: NextPageWithLayout = () => {
  return null;
};

export default Page;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  return {
    redirect: {
      destination: '/settings/appearance',
      permanent: true,
    },
  };
};
