import React, { useState } from 'react';
import type { AppPropsWithLayout } from './types';
import { ChakraProvider, Flex } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { sseUrl } from '@api';
import { Panes } from '@features/Panes';
import { ActiveCollectionContextProvider } from '@features/ActiveCollection';
import { SSEListener } from '@features/SSEListener';
import { theme } from '../theme';
import { fontFaces } from '../theme/fonts';

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

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ChakraProvider theme={theme}>
          <ActiveCollectionContextProvider>
            <SSEListener>
              <Global styles={fontFaces} />

              <Flex minH="100vh" direction="column">
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
