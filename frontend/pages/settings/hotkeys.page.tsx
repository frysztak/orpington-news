import Head from 'next/head';
import { VStack, Box } from '@chakra-ui/react';
import type { NextPageWithLayout } from '@pages/types';
import { SettingsLayout } from './SettingsLayout';
import { HotkeysGuide } from '@features/HotKeys/HotkeysGuide';

const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Hotkeys</title>
      </Head>

      <VStack w="full" align="flex-start" p={4} spacing={4}>
        <Box as="h2" textStyle="settings.header">
          Hotkeys
        </Box>

        <HotkeysGuide />
      </VStack>
    </>
  );
};

Page.getLayout = (page) => {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Page;
