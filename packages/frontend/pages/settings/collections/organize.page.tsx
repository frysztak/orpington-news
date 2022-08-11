import Head from 'next/head';
import { Alert, AlertIcon, Box, VStack } from '@chakra-ui/react';
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
        {isTouchscreen ? (
          <Alert status="warning">
            <AlertIcon />
            Organizing collections is unfortunately unavailable on mobile
            devices.
          </Alert>
        ) : (
          <OrganizeCollections flatCollections={flatCollections} />
        )}
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
