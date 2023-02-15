import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMediaQuery } from '@chakra-ui/react';
import { useIsClient } from 'usehooks-ts';
import type { NextPageWithLayout } from '@pages/types';
import { SettingsSidebar } from './components/sidebar/SettingsSidebar';

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const isClient = useIsClient();
  const [isMobile] = useMediaQuery(['(max-width: 768px)']);

  useEffect(() => {
    if (isClient && !isMobile) {
      router.push('/settings/appearance');
    }
  }, [isClient, isMobile, router]);

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>

      <SettingsSidebar pt={4} px={2} />
    </>
  );
};

Page.getLayout = (page) => page;

export default Page;
