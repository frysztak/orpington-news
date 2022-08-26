import Head from 'next/head';
import { Alert, AlertIcon, Box, Progress, VStack } from '@chakra-ui/react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { OrganizeCollections } from '@features/OrganizeCollections';
import { useCollectionsList } from '@features/Collections';
import { FlatCollection } from '@orpington-news/shared';
import type { NextPageWithLayout } from '@pages/types';
import { useIsTouchscreen } from '@utils';
import { SettingsLayout } from '../SettingsLayout';

const Page: NextPageWithLayout = () => {
  const isTouchscreen = useIsTouchscreen();
  const query = useCollectionsList<FlatCollection[]>();

  return (
    <>
      <Head>
        <title>Organize collections</title>
      </Head>

      <VStack w="full" h="calc(100vh)" align="flex-start" py={4}>
        <Box as="h2" textStyle="settings.header" px={4}>
          Organize
        </Box>
        {isTouchscreen ? (
          <Alert status="warning">
            <AlertIcon />
            Organizing collections is unfortunately unavailable on mobile
            devices.
          </Alert>
        ) : query.status === 'loading' ? (
          <Progress />
        ) : query.status === 'success' ? (
          <OrganizeCollections flatCollections={query.data} />
        ) : null}
      </VStack>
    </>
  );
};

Page.getLayout = (page) => {
  return (
    <SettingsLayout>
      <DndProvider backend={HTML5Backend}>{page}</DndProvider>
    </SettingsLayout>
  );
};

export default Page;
