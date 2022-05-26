import React, { useCallback } from 'react';
import type { NextPageWithLayout } from '@pages/types';
import { useRouter } from 'next/router';
import Head from 'next/head';
import getConfig from 'next/config';
import NextLink from 'next/link';
import {
  Heading,
  VStack,
  Container,
  Text,
  Alert,
  AlertIcon,
  Code,
  Link,
} from '@chakra-ui/react';
import { getSSProps } from '@pages/ssrProps';
import { LoginFormData, useLogin } from '@features/Auth';
import { useEventListenerContext } from '@features/EventListener';
import { LoginForm } from './LoginForm';

const LoginPage: NextPageWithLayout = () => {
  const router = useRouter();

  const { isLoading, mutate } = useLogin();
  const { publicRuntimeConfig } = getConfig();
  const demoMode = Boolean(publicRuntimeConfig.APP_DEMO);

  const { attemptToConnect } = useEventListenerContext();
  const handleSubmit = useCallback(
    (data: LoginFormData) => {
      mutate(data, {
        onSuccess: async () => {
          await window.caches.delete('next-data');
          await window.caches.delete('apis');
          router.push('/');
          attemptToConnect();
        },
      });
    },
    [attemptToConnect, mutate, router]
  );

  return (
    <>
      <Head>
        <title>Log in</title>
      </Head>

      <Container maxW="container.sm" py={4}>
        <VStack w="full" spacing={16} align="stretch">
          <Heading textAlign="center">Log in</Heading>
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />

          {demoMode ? (
            <Alert status="info">
              <AlertIcon />
              <VStack align="flex-start">
                <Text>This is a demo instance.</Text>
                <Text>
                  Username: <Code>demo</Code>
                </Text>
                <Text>
                  Password: <Code>demo</Code>
                </Text>
              </VStack>
            </Alert>
          ) : (
            <Alert status="info">
              <AlertIcon />
              <VStack align="flex-start">
                <Text>
                  Don&apos;t have an account yet?{' '}
                  <NextLink href="/signup" passHref>
                    <Link fontWeight="bold">Sign up</Link>
                  </NextLink>
                </Text>
              </VStack>
            </Alert>
          )}
        </VStack>
      </Container>
    </>
  );
};

LoginPage.getLayout = (page) => {
  return page;
};

export const getServerSideProps = getSSProps({
  requireAuthorization: false,
});

export default LoginPage;
