import Head from 'next/head';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { OrganizeCollections } from '@features/OrganizeCollections';
import { useCollectionsList } from '@features/Collections';
import { FlatCollection } from '@orpington-news/shared';
import type { NextPageWithLayout } from '@pages/types';
import { commonGetServerSideProps } from '@pages/ssrProps';
import { SettingsLayout } from './SettingsLayout';
import { Heading, VStack } from '@chakra-ui/react';

const Page: NextPageWithLayout = () => {
  const { data: flatCollections } = useCollectionsList<FlatCollection[]>();

  return (
    <>
      <Head>
        <title>Organize collections</title>
      </Head>

      <VStack w="full" align="flex-start" py={4}>
        <Heading px={4} fontSize="2xl">
          Organize
        </Heading>
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
