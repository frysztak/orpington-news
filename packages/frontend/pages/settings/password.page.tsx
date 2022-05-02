import { useCallback } from 'react';
import Head from 'next/head';
import type { NextPageWithLayout } from '@pages/types';
import { getSSProps } from '@pages/ssrProps';
import { Box, Container, useToast, VStack } from '@chakra-ui/react';
import { useChangePassword } from '@features/Auth';
import { SettingsLayout } from './SettingsLayout';
import {
  ChangePasswordForm,
  ChangePasswordFormData,
} from './components/password/ChangePasswordForm';

const Page: NextPageWithLayout = () => {
  const toast = useToast();
  const { mutate, isLoading } = useChangePassword();

  const handleSubmit = useCallback(
    ({ currentPassword, newPassword }: ChangePasswordFormData) => {
      mutate(
        {
          currentPassword,
          newPassword,
        },
        {
          onSuccess: () => {
            toast({
              status: 'success',
              title: 'Success',
              description: 'Password successfully changed!',
            });
          },
        }
      );
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

export const getServerSideProps = getSSProps({});
