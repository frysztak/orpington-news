import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMediaQuery } from '@chakra-ui/react';
import type { NextPageWithLayout } from '@pages/types';
import { getSSProps } from '@pages/ssrProps';
import { SettingsSidebar } from './components/sidebar/SettingsSidebar';

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const [isMobile] = useMediaQuery(['(max-width: 30em)']);

  if (!isMobile) {
    router.push('/settings/appearance');
  }

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>

      <SettingsSidebar py={4} px={2} />
    </>
  );
};

Page.getLayout = (page) => page;

export default Page;

export const getServerSideProps = getSSProps({});
