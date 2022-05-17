import React, { useState } from 'react';
import type { AppPropsWithLayout } from './types';
import {
  ChakraProvider,
  cookieStorageManagerSSR,
  Flex,
} from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { Panes } from '@features/Panes';
import { CollectionsContextProvider } from '@features/Collections';
import { EventListenerContextProvider } from '@features/EventListener';
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
            retry: (failureCount: number, error: any) => {
              if (error?.json?.statusCode === 401) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  const getLayout = Component.getLayout || ((page) => <Panes>{page}</Panes>);

  const colorModeManager = cookieStorageManagerSSR(
    pageProps.chakraCookie ?? ''
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
          <Compose
            components={[
              ApiContextProvider,
              EventListenerContextProvider,
              CollectionsContextProvider,
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
