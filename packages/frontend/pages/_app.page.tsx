import React, { useState } from 'react';
import type { AppProps } from 'next/app';
import { ChakraProvider, Flex } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { theme } from '../theme';
import { fontFaces } from '../theme/fonts';

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ChakraProvider theme={theme}>
          <Global styles={fontFaces} />

          <Flex minH="100vh" direction="column">
            <Component {...pageProps} />
          </Flex>
        </ChakraProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
