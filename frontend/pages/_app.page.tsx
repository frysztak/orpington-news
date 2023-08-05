import '../styles/global.scss';
import React, { PropsWithChildren, useState } from 'react';
import type { AppPropsWithLayout } from './types';
import { ChakraProvider, Flex } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { Panes } from '@features/Panes';
import { CollectionsContextProvider } from '@features/Collections';
import { EventListenerContextProvider } from '@features/EventListener';
import { useGetUser } from '@features/Auth';
import { ApiContextProvider, useApiContext } from '@api';
import { theme, fontFaces, MetaTheme } from 'theme';
import Compose from '@utils/Compose';
import { hotkeyScopeGlobal, hotkeyScopeNone } from '@features/HotKeys/scopes';

const AuthGuard: React.FC<PropsWithChildren> = ({ children }) => {
  const { showAppContent, setShowAppContent } = useApiContext();

  useGetUser({
    onSuccess: () => {
      setShowAppContent(true);
    },
  });

  return showAppContent ? <>{children}</> : <></>;
};

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

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={(pageProps as any).dehydratedState}>
        <ChakraProvider theme={theme}>
          <Compose
            components={[
              ApiContextProvider,
              EventListenerContextProvider,
              CollectionsContextProvider,
            ]}
          >
            <HotkeysProvider
              initiallyActiveScopes={[hotkeyScopeNone, hotkeyScopeGlobal]}
            >
              <Global styles={fontFaces} />

              <Flex minH="100vh" direction="column">
                <MetaTheme />
                <AuthGuard>{getLayout(<Component {...pageProps} />)}</AuthGuard>
              </Flex>
            </HotkeysProvider>
          </Compose>
        </ChakraProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
