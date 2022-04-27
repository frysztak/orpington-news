import { useCallback } from 'react';
import Head from 'next/head';
import type { NextPageWithLayout } from '@pages/types';
import { commonGetServerSideProps } from '@pages/ssrProps';
import {
  Box,
  Container,
  Heading,
  useTimeout,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useChangePassword, useLogout } from '@features/Auth';
import { SettingsLayout } from './SettingsLayout';
import { ChangePasswordForm } from './components/password/ChangePasswordForm';

const Page: NextPageWithLayout = () => {
  const toast = useToast();
  const { mutate, isLoading } = useChangePassword();

  const handleSubmit = useCallback(
    (password: string) => {
      mutate(password, {
        onSuccess: () => {
          toast({
            status: 'success',
            title: 'Success',
            description: 'Password successfully changed!',
          });
        },
      });
    },
    [mutate, toast]
  );

  return (
    <>
      <Head>
        <title>Change password</title>
      </Head>

      <Container maxW="container.sm" py={4}>
        <VStack w="full" align="stretch">
          <Box as="h2" textStyle="settings.header">
            Change password
          </Box>
          <ChangePasswordForm isLoading={isLoading} onSubmit={handleSubmit} />
        </VStack>
      </Container>
    </>
  );
};

Page.getLayout = (page) => {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Page;

export const getServerSideProps = commonGetServerSideProps;
