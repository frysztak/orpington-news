import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { Box, VStack } from '@chakra-ui/react';
import { dehydrate, QueryClient } from 'react-query';
import type { NextPageWithLayout } from '@pages/types';
import { getChakraColorModeCookie, getCookieHeaderFromReq } from '@utils';
import { getPreferences, ssrApi } from '@api';
import { preferencesKeys } from '@features/queryKeys';
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
        <Box as="h2" textStyle="settings.header">
          Appearance
        </Box>

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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const chakraCookie = getChakraColorModeCookie(req);
  if (!req.cookies['sessionId']) {
    return {
      props: { chakraCookie },
      redirect: {
        destination: '/login',
      },
    };
  }

  const apiWithHeaders = ssrApi().headers(getCookieHeaderFromReq(req));
  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery(preferencesKeys.base, () =>
      getPreferences(apiWithHeaders)
    ),
  ]);

  return {
    props: {
      chakraCookie,
      dehydratedState: dehydrate(queryClient),
    },
  };
};
