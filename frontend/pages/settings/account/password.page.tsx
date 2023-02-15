import { useCallback } from 'react';
import Head from 'next/head';
import type { NextPageWithLayout } from '@pages/types';
import {
  Alert,
  AlertIcon,
  Box,
  Container,
  useToast,
  VStack,
  Text,
} from '@chakra-ui/react';
import { isDemoMode } from '@utils';
import { useChangePassword } from '@features/Auth';
import { SettingsLayout } from '../SettingsLayout';
import {
  ChangePasswordForm,
  ChangePasswordFormData,
} from '../components/password/ChangePasswordForm';

const Page: NextPageWithLayout = () => {
  const toast = useToast();
  const { mutate, isLoading } = useChangePassword();

  const demoMode = isDemoMode();

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
          <ChangePasswordForm
            isLoading={isLoading}
            isDisabled={demoMode}
            onSubmit={handleSubmit}
          />

          {demoMode && (
            <Box>
              <Alert mt={16} status="info">
                <AlertIcon />
                <VStack align="flex-start">
                  <Text>
                    This is a demo instance. Password change is disabled.
                  </Text>
                </VStack>
              </Alert>
            </Box>
          )}
        </VStack>
      </Container>
    </>
  );
};

Page.getLayout = (page) => {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Page;
