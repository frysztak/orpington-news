import React from 'react';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { theme } from '../theme';
import { fontFaces } from '../theme/fonts';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Global styles={fontFaces} />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
