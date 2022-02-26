import Head from 'next/head';
import type { NextPageWithLayout } from '@pages/types';
import { commonGetServerSideProps } from '@pages/ssrProps';
import { SettingsSidebar } from './components/sidebar/SettingsSidebar';

const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>

      <SettingsSidebar py={4} />
    </>
  );
};

Page.getLayout = (page) => page;

export default Page;

export const getServerSideProps = commonGetServerSideProps;
