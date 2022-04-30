import { useCallback } from 'react';
import Head from 'next/head';
import type { NextPageWithLayout } from '@pages/types';
import { commonGetServerSideProps } from '@pages/ssrProps';
import { Box, Container, useToast, VStack } from '@chakra-ui/react';
import { useGetUser, useSetUser } from '@features/Auth';
import { SettingsLayout } from './SettingsLayout';
import {
  EditAccountForm,
  EditAccountFormData,
} from './components/account/EditAccountForm';

const Page: NextPageWithLayout = () => {
  const { data: user, isLoading } = useGetUser();
  const { mutate, isLoading: isSaving } = useSetUser();
  const toast = useToast();

  const handleSubmit = useCallback(
    (data: EditAccountFormData) => {
      mutate(data, {
        onSuccess: () => {
          toast({
            status: 'success',
            description: 'Changes saved!',
          });
        },
      });
    },
    [mutate, toast]
  );

  return (
    <>
      <Head>
        <title>Account info</title>
      </Head>

      <Container maxW="container.sm" py={4}>
        <VStack w="full" align="stretch">
          <Box as="h2" textStyle="settings.header">
            Account info
          </Box>
          <EditAccountForm
            initialValues={user}
            onSubmit={handleSubmit}
            isDisabled={isLoading}
            isLoading={isLoading || isSaving}
          />
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
