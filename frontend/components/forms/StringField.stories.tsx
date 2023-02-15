import React from 'react';
import { Box, Button, VStack } from '@chakra-ui/react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { StringField, StringFieldProps } from './StringField';

interface FormData {
  text: string;
}

const defaultInitialValues: FormData = {
  text: '',
};

const validationSchema = Yup.object({
  text: Yup.string().required('Please enter your username'),
});

export default {
  title: 'Core/Forms/String Field',
  component: Formik,
} as Meta;

type Props = Omit<StringFieldProps, 'name'> & {
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
        <Form noValidate>
          <VStack spacing={4}>
            <StringField
              name="text"
              placeholder="Username"
              isDisabled={isLoading}
              isRequired={true}
              {...inputProps}
            />

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
