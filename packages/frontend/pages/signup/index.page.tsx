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
  Link,
  useToast,
} from '@chakra-ui/react';
import { getSSProps } from '@pages/ssrProps';
import { SignupFormData, useSignup } from '@features/Auth';
import { SignupForm } from './SignupForm';

const SignupPage: NextPageWithLayout = () => {
  const router = useRouter();
  const toast = useToast();

  const onSuccess = useCallback(() => {
    toast({
      title: 'Success!',
      description: 'Account successfully created.',
      status: 'success',
    });

    router.push('/login');
  }, [router, toast]);

  const { isLoading, mutate } = useSignup();
  const { publicRuntimeConfig } = getConfig();
  const demoMode = Boolean(publicRuntimeConfig.APP_DEMO);

  const handleSubmit = useCallback(
    (data: SignupFormData) => {
      mutate(data, { onSuccess });
    },
    [mutate, onSuccess]
  );

  return (
    <>
      <Head>
        <title>Sign up</title>
      </Head>

      <Container maxW="container.sm" py={4}>
        <VStack w="full" spacing={16} align="stretch">
          <Heading textAlign="center">Sign up</Heading>
          <SignupForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isDisabled={demoMode}
          />

          {demoMode ? (
            <Alert status="info">
              <AlertIcon />
              <VStack align="flex-start">
                <Text>
                  This is a demo instance. Account creation is disabled.{' '}
                  <NextLink href="/login" passHref>
                    <Link fontWeight="bold">Log in</Link>
                  </NextLink>
                </Text>
              </VStack>
            </Alert>
          ) : (
            <Alert status="info">
              <AlertIcon />
              <VStack align="flex-start">
                <Text>
                  Have an account already?{' '}
                  <NextLink href="/login" passHref>
                    <Link fontWeight="bold">Log in</Link>
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

SignupPage.getLayout = (page) => {
  return page;
};

export const getServerSideProps = getSSProps({
  requireAuthorization: false,
});

export default SignupPage;
