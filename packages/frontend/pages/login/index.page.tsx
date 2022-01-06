import React, { useCallback } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useMutation } from 'react-query';
import { Heading, VStack, Container } from '@chakra-ui/react';
import { api, useHandleError } from '@api';
import { LoginForm, LoginFormData } from './LoginForm';

const LoginPage: NextPage = () => {
  const { push } = useRouter();
  const { onError } = useHandleError();

  const onSuccess = useCallback(() => {
    push('/');
  }, [push]);

  const { isLoading, mutate } = useMutation(
    (data: LoginFormData) => api.url('/auth/login').post(data).json(),
    {
      onSuccess,
      onError,
    }
  );

  return (
    <>
      <Head>
        <title>Log in</title>
      </Head>

      <Container maxW="container.sm" py={4}>
        <VStack w="full" spacing={16} align="stretch">
          <Heading textAlign="center">Log in</Heading>
          <LoginForm onSubmit={mutate} isLoading={isLoading} />
        </VStack>
      </Container>
    </>
  );
};

export default LoginPage;
