import React, { useCallback } from 'react';
import type { NextPageWithLayout } from '@pages/types';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import getConfig from 'next/config';
import { useMutation } from 'react-query';
import {
  Heading,
  VStack,
  Container,
  Text,
  Alert,
  AlertIcon,
  Code,
} from '@chakra-ui/react';
import { useApi, useHandleError } from '@api';
import { LoginForm, LoginFormData } from './LoginForm';

const LoginPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { onError } = useHandleError();
  const api = useApi();

  const onSuccess = useCallback(() => {
    router.push('/');
  }, [router]);

  const { isLoading, mutate } = useMutation(
    (data: LoginFormData) => api.url('/auth/login').post(data).json(),
    {
      onSuccess,
      onError,
    }
  );

  const { publicRuntimeConfig } = getConfig();

  return (
    <>
      <Head>
        <title>Log in</title>
      </Head>

      <Container maxW="container.sm" py={4}>
        <VStack w="full" spacing={16} align="stretch">
          <Heading textAlign="center">Log in</Heading>
          <LoginForm onSubmit={mutate} isLoading={isLoading} />

          {publicRuntimeConfig.APP_DEMO && (
            <Alert status="info">
              <AlertIcon />
              <VStack align="flex-start">
                <Text>This is a demo instance.</Text>
                <Text>
                  Username: <Code>{publicRuntimeConfig.APP_DEMO_USERNAME}</Code>
                </Text>
                <Text>
                  Password: <Code>{publicRuntimeConfig.APP_DEMO_PASSWORD}</Code>
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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookies = req.headers.cookie ?? '';

  return {
    props: {
      cookies,
    },
  };
};

export default LoginPage;
