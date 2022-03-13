import React, { useState } from 'react';
import type { AppPropsWithLayout } from './types';
import { ChakraProvider, cookieStorageManager, Flex } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { Panes } from '@features/Panes';
import { ActiveCollectionContextProvider } from '@features/ActiveCollection';
import { SSEListener } from '@features/SSEListener';
import { PreferencesContextProvider } from '@features/Preferences';
import { ApiContextProvider } from '@api';
import { theme, fontFaces, MetaTheme } from 'theme';
import Compose from '@utils/Compose';

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const getLayout = Component.getLayout || ((page) => <Panes>{page}</Panes>);

  const colorModeManager = cookieStorageManager(pageProps.chakraCookie ?? '');

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
          <Compose
            components={[
              ApiContextProvider,
              ActiveCollectionContextProvider,
              SSEListener,
              PreferencesContextProvider,
            ]}
          >
            <Global styles={fontFaces} />

            <Flex minH="100vh" direction="column">
              <MetaTheme />
              {getLayout(<Component {...pageProps} />)}
            </Flex>
          </Compose>
        </ChakraProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
