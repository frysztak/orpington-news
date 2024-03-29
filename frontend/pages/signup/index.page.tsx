import React, { useCallback } from 'react';
import type { NextPageWithLayout } from '@pages/types';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
import { SignupFormData, useSignup } from '@features/Auth';
import { isDemoMode } from '@utils';
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
  const demoMode = isDemoMode();

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
                  <Link as={NextLink} href="/login" fontWeight="bold">
                    Log in
                  </Link>
                </Text>
              </VStack>
            </Alert>
          ) : (
            <Alert status="info">
              <AlertIcon />
              <VStack align="flex-start">
                <Text>
                  Have an account already?{' '}
                  <Link as={NextLink} href="/login" fontWeight="bold">
                    Log in
                  </Link>
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

export default SignupPage;
