import React, { useCallback } from 'react';
import { Button, HStack, VStack } from '@chakra-ui/react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { PasswordField } from '@components/forms';

export interface ChangePasswordFormProps {
  isLoading?: boolean;
  onSubmit: (data: ChangePasswordFormData) => void;
}

export const validationSchema = Yup.object({
  currentPassword: Yup.string().required('Please enter your current password.'),
  newPassword: Yup.string().required('Please enter your new password.'),
  newPasswordConfirm: Yup.string()
    .oneOf([Yup.ref('newPassword')], "Passwords don't match.")
    .required('Please confirm your new password.'),
});

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

const initialValues: ChangePasswordFormData = {
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
};

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = (
  props
) => {
  const { onSubmit, isLoading } = props;

  const handleSubmit = useCallback(
    (data: ChangePasswordFormData) => onSubmit(data),
    [onSubmit]
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isValid }) => (
        <Form noValidate>
          <VStack spacing={4} w="full">
            <PasswordField
              name="currentPassword"
              label="Current password"
              isDisabled={isLoading}
              autoComplete="current-password"
              isRequired
            />

            <PasswordField
              name="newPassword"
              label="New password"
              isDisabled={isLoading}
              autoComplete="new-password"
              isRequired
            />

            <PasswordField
              name="newPasswordConfirm"
              label="Confirm new password"
              isDisabled={isLoading}
              autoComplete="new-password"
              isRequired
            />

            <HStack w="full" justify="flex-end">
              <Button
                type="submit"
                w={['full', 40]}
                mt={4}
                isDisabled={!isValid}
                isLoading={isLoading}
              >
                Save password
              </Button>
            </HStack>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};
