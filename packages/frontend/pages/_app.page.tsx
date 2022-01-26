import React, { useState } from 'react';
import type { AppPropsWithLayout } from './types';
import { ChakraProvider, cookieStorageManager, Flex } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { Panes } from '@features/Panes';
import { ActiveCollectionContextProvider } from '@features/ActiveCollection';
import { SSEListener } from '@features/SSEListener';
import { theme, fontFaces, MetaTheme } from 'theme';

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

  const colorModeManager = cookieStorageManager(pageProps.cookies ?? '');

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
          <ActiveCollectionContextProvider>
            <SSEListener>
              <Global styles={fontFaces} />

              <Flex minH="100vh" direction="column">
                <MetaTheme />
                {getLayout(<Component {...pageProps} />)}
              </Flex>
            </SSEListener>
          </ActiveCollectionContextProvider>
        </ChakraProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
