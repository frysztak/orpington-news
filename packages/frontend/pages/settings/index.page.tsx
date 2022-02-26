import Head from 'next/head';
import NextLink from 'next/link';
import { IconButton, VStack } from '@chakra-ui/react';
import { IoReturnUpBack } from '@react-icons/all-files/io5/IoReturnUpBack';
import type { NextPageWithLayout } from '@pages/types';
import { commonGetServerSideProps } from '@pages/ssrProps';
import { SettingsSidebar } from './components/sidebar/SettingsSidebar';

const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>

      <VStack spacing={2}>
        <NextLink href="/" passHref>
          <IconButton
            icon={<IoReturnUpBack />}
            aria-label="Go back to homepage"
            variant="ghost"
            mr="auto"
          />
        </NextLink>

        <SettingsSidebar py={4} />
      </VStack>
    </>
  );
};

Page.getLayout = (page) => page;

export default Page;

export const getServerSideProps = commonGetServerSideProps;
