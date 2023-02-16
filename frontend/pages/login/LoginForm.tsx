import React from 'react';
import { Button, HStack, VStack } from '@chakra-ui/react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { LoginFormData } from '@features/Auth';
import { PasswordField, StringField } from '@components/forms';

export interface LoginFormProps {
  isLoading?: boolean;
  onSubmit: (data: LoginFormData) => void;
}

export const validationSchema = Yup.object({
  username: Yup.string().required('Please enter your username.'),
  password: Yup.string().required('Please enter your password.'),
});

const initialValues: LoginFormData = {
  username: '',
  password: '',
};

export const LoginForm: React.FC<LoginFormProps> = (props) => {
  const { onSubmit, isLoading } = props;

  const handleSubmit = (data: LoginFormData) => onSubmit(data);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isValid }) => (
        <Form noValidate>
          <VStack spacing={4} w="full">
            <StringField
              name="username"
              label="Username"
              isDisabled={isLoading}
              isRequired
              autoComplete="username"
              data-test="username"
            />

            <PasswordField
              name="password"
              label="Password"
              isDisabled={isLoading}
              isRequired
              autoComplete="current-password"
              data-test="password"
            />

            <HStack w="full" justify="flex-end">
              <Button
                type="submit"
                w={['full', 40]}
                mt={4}
                isLoading={isLoading}
                data-test="submit"
              >
                Login
              </Button>
            </HStack>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};
