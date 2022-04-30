import React, { useCallback } from 'react';
import { Button, HStack, VStack } from '@chakra-ui/react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { PasswordField } from '@components/forms';

export interface ChangePasswordFormProps {
  isLoading?: boolean;
  onSubmit: (data: string) => void;
}

export const validationSchema = Yup.object({
  password: Yup.string().required('Please enter your new password.'),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref('password')], "Passwords don't match.")
    .required('Please confirm your new password.'),
});

interface ChangePasswordFormData {
  password: string;
  passwordConfirm: string;
}

const initialValues: ChangePasswordFormData = {
  password: '',
  passwordConfirm: '',
};

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = (
  props
) => {
  const { onSubmit, isLoading } = props;

  const handleSubmit = useCallback(
    (data: ChangePasswordFormData) => onSubmit(data.password),
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
              name="password"
              label="New password"
              isDisabled={isLoading}
              isRequired
            />

            <PasswordField
              name="passwordConfirm"
              label="Confirm new password"
              isDisabled={isLoading}
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
