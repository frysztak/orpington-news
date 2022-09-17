import React from 'react';
import { Box, Button, HStack, VStack } from '@chakra-ui/react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { AvatarField, PasswordField, StringField } from '@components/forms';
import { SignupFormData } from '@features/Auth';

export interface SignupFormProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  onSubmit: (data: SignupFormData) => void;
}

export const validationSchema = Yup.object({
  username: Yup.string().required('Please enter your username.'),
  displayName: Yup.string().required('Please enter your display name.'),
  password: Yup.string().required('Please enter your password.'),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref('password')], "Passwords don't match.")
    .required('Please confirm your password.'),
});

const initialValues: SignupFormData = {
  username: '',
  password: '',
  displayName: '',
};

export const SignupForm: React.FC<SignupFormProps> = (props) => {
  const { onSubmit, isLoading, isDisabled } = props;

  const handleSubmit = (data: SignupFormData) => onSubmit(data);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isValid, values: { displayName } }) => (
        <Form noValidate>
          <VStack spacing={4} w="full">
            <StringField
              name="username"
              label="Username"
              helperText="You'll use this to log in into the app."
              isDisabled={isDisabled || isLoading}
              autoComplete="username"
              isRequired
              data-test="username"
            />

            <HStack w="full" align="center">
              <StringField
                name="displayName"
                label="Display name"
                helperText="Friendly username."
                isDisabled={isDisabled || isLoading}
                isRequired
                data-test="displayName"
              />
              <Box flexBasis="20%" maxW={14} pr={2}>
                <AvatarField name="avatar" displayName={displayName} />
              </Box>
            </HStack>

            <PasswordField
              name="password"
              label="Password"
              helperText="Pick a good one."
              isDisabled={isDisabled || isLoading}
              autoComplete="new-password"
              isRequired
              data-test="password"
            />

            <PasswordField
              name="passwordConfirm"
              label="Confirm password"
              helperText="Confirm your password."
              isDisabled={isDisabled || isLoading}
              autoComplete="new-password"
              isRequired
              data-test="passwordConfirm"
            />

            <HStack w="full" justify="flex-end">
              <Button
                type="submit"
                w={['full', 40]}
                mt={4}
                isDisabled={isDisabled || !isValid}
                isLoading={isLoading}
                data-test="submit"
              >
                Signup
              </Button>
            </HStack>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};
