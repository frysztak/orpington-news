import Head from 'next/head';
import { Heading, VStack } from '@chakra-ui/react';
import type { NextPageWithLayout } from '@pages/types';
import { commonGetServerSideProps } from '@pages/ssrProps';
import { SettingsLayout } from './SettingsLayout';
import { useCustomizeSettings } from './components/customize/useCustomizeSettings';
import { CustomizeAppearance } from './components/customize/CustomizeAppearance';

const Page: NextPageWithLayout = () => {
  const { currentSettings, onSettingsChange } = useCustomizeSettings();

  return (
    <>
      <Head>
        <title>Customize appearance</title>
      </Head>

      <VStack w="full" align="flex-start" p={4}>
        <Heading fontSize="2xl">Appearance</Heading>

        <CustomizeAppearance
          currentData={currentSettings}
          onChange={onSettingsChange}
        />
      </VStack>
    </>
  );
};

Page.getLayout = (page) => {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Page;

export const getServerSideProps = commonGetServerSideProps;
