import { useRouter } from 'next/router';
import Head from 'next/head';
import type { NextPageWithLayout } from '@pages/types';
import { commonGetServerSideProps } from '@pages/ssrProps';
import { Heading, useTimeout } from '@chakra-ui/react';
import { useLogout } from '@features/Auth';
import { SettingsLayout } from './SettingsLayout';

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const { mutate } = useLogout();

  useTimeout(() => {
    mutate(void 0, {
      onSuccess: () => {
        router.push('/');
      },
    });
  }, 200);

  return (
    <>
      <Head>
        <title>Log out</title>
      </Head>

      <Heading py={4} fontSize="xl">
        Logging you out...
      </Heading>
    </>
  );
};

Page.getLayout = (page) => {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Page;

export const getServerSideProps = commonGetServerSideProps;
