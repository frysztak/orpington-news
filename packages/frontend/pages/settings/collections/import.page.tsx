import Head from 'next/head';
import { Box, VStack } from '@chakra-ui/react';
import { NextPageWithLayout } from '@pages/types';
import { SettingsLayout } from '../SettingsLayout';
import { FileDropZone } from '@components/inputs';
import { useImportOPML } from './useImportOPML';

const Page: NextPageWithLayout = () => {
  const { isLoading, mutate } = useImportOPML();

  return (
    <>
      <Head>
        <title>Import collections</title>
      </Head>

      <VStack w="full" align="flex-start" py={4}>
        <Box as="h2" textStyle="settings.header" px={4}>
          Import OPML
        </Box>

        <FileDropZone isLoading={isLoading} onDrop={mutate} />
      </VStack>
    </>
  );
};

Page.getLayout = (page) => {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Page;
