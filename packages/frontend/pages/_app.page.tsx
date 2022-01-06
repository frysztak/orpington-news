import React from 'react';
import type { AppProps } from 'next/app';
import { Box, ChakraProvider, Flex } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { theme } from '../theme';
import { fontFaces } from '../theme/fonts';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Global styles={fontFaces} />

        <Flex minH="100vh" direction="column">
          <Component {...pageProps} />
        </Flex>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
