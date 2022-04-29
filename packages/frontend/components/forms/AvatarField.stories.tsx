import React from 'react';
import { Box, Button, HStack, VStack } from '@chakra-ui/react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { AvatarField, AvatarFieldProps } from './AvatarField';
import { StringField } from './StringField';

interface FormData {
  displayName: string;
  avatar?: string;
}

const defaultInitialValues: FormData = {
  displayName: '',
};

const validationSchema = Yup.object({
  displayName: Yup.string().required('Please enter your username'),
});

export default {
  title: 'Core/Forms/Avatar Field',
  component: Formik,
} as Meta;

type Props = Omit<AvatarFieldProps, 'name'> & {
  formProps: {
    enableValidation?: boolean;
    isLoading?: boolean;
    initialValues?: FormData;
  };
};
const Template: Story<Props> = (args) => {
  const { formProps, ...inputProps } = args;
  const { initialValues, enableValidation, isLoading } = formProps || {};

  const handleSubmit = (values: FormData) => {
    action('onSubmit')(values);
  };

  return (
    <Box width={['xs', 'sm', 'md']}>
      <Formik
        initialValues={initialValues || defaultInitialValues}
        validationSchema={
          enableValidation || true ? validationSchema : undefined
        }
        onSubmit={handleSubmit}
      >
        {({ values: { displayName } }) => (
          <Form noValidate>
            <VStack spacing={4}>
              <HStack w="full">
                <StringField
                  name="displayName"
                  placeholder="Username"
                  isDisabled={isLoading}
                />

                <Box flexBasis="20%">
                  <AvatarField name="avatar" displayName={displayName} />
                </Box>
              </HStack>

              <Button
                width="full"
                type="submit"
                isLoading={isLoading}
                loadingText="Submitting..."
              >
                Submit
              </Button>
            </VStack>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export const Basic = Template.bind({});
Basic.args = {};

export const Loading = Template.bind({});
Loading.args = {
  formProps: {
    isLoading: true,
  },
};

export const Disabled = Template.bind({});
Disabled.args = {
  isDisabled: true,
};

export const Preselected = Template.bind({});
Preselected.args = {
  formProps: {
    initialValues: {
      text: 'preentered text',
    },
  },
};
