import Head from 'next/head';
import { Box, VStack } from '@chakra-ui/react';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { OrganizeCollections } from '@features/OrganizeCollections';
import { useCollectionsList } from '@features/Collections';
import { FlatCollection } from '@orpington-news/shared';
import type { NextPageWithLayout } from '@pages/types';
import { commonGetServerSideProps } from '@pages/ssrProps';
import { SettingsLayout } from './SettingsLayout';

const Page: NextPageWithLayout = () => {
  const { data: flatCollections } = useCollectionsList<FlatCollection[]>();

  return (
    <>
      <Head>
        <title>Organize collections</title>
      </Head>

      <VStack w="full" align="flex-start" py={4}>
        <Box as="h2" textStyle="settings.header" px={4}>
          Organize
        </Box>
        <OrganizeCollections flatCollections={flatCollections} />
      </VStack>
    </>
  );
};

Page.getLayout = (page) => {
  return (
    <SettingsLayout>
      <DndProvider options={HTML5toTouch}>{page}</DndProvider>
    </SettingsLayout>
  );
};

export default Page;

export const getServerSideProps = commonGetServerSideProps;
