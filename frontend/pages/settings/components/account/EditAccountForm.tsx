import React from 'react';
import { Box, Button, HStack, VStack } from '@chakra-ui/react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { AvatarField, StringField } from '@components/forms';
import { SignupFormData } from '@features/Auth';

export type EditAccountFormData = Pick<
  SignupFormData,
  'username' | 'displayName' | 'avatar'
>;

export interface EditAccountFormProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  initialValues?: EditAccountFormData;
  onSubmit: (data: EditAccountFormData) => void;
}

export const validationSchema = Yup.object({
  displayName: Yup.string().required('Please enter your display name.'),
});

const initVals: EditAccountFormData = {
  username: '',
  displayName: '',
};

export const EditAccountForm: React.FC<EditAccountFormProps> = (props) => {
  const { onSubmit, isLoading, isDisabled, initialValues } = props;

  const handleSubmit = (data: EditAccountFormData) => onSubmit(data);

  return (
    <Formik
      initialValues={initialValues ?? initVals}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isValid, values: { displayName } }) => (
        <Form noValidate data-test="editAccountForm">
          <VStack spacing={4} w="full">
            <StringField
              name="username"
              helperText="You'll use this to log in into the app."
              label="Username"
              isDisabled={true}
              data-test="username"
            />

            <HStack w="full" align="center">
              <StringField
                name="displayName"
                helperText="Friendly username."
                label="Display name"
                isDisabled={isDisabled || isLoading}
                isRequired
                data-test="displayName"
              />
              <Box flexBasis="20%" maxW={14} pr={2}>
                <AvatarField name="avatarUrl" displayName={displayName} />
              </Box>
            </HStack>

            <HStack w="full" justify="flex-end">
              <Button
                type="submit"
                w={['full', 40]}
                mt={4}
                isDisabled={isDisabled || !isValid}
                isLoading={isLoading}
                data-test="save"
              >
                Save
              </Button>
            </HStack>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};
