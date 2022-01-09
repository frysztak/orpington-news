import React from 'react';
import { Button, HStack, VStack } from '@chakra-ui/react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { PasswordField, StringField } from '@components/forms';

export interface LoginFormProps {
  isLoading?: boolean;
  onSubmit: (data: LoginFormData) => void;
}

export interface LoginFormData {
  username: string;
  password: string;
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
              placeholder="Username"
              isDisabled={isLoading}
              isRequired
            />

            <PasswordField
              name="password"
              placeholder="Password"
              isDisabled={isLoading}
              isRequired
            />

            <HStack w="full" justify="flex-end">
              <Button
                type="submit"
                w={['full', 40]}
                mt={4}
                isLoading={isLoading}
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