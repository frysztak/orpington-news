import React from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { SignupForm, SignupFormProps } from './SignupForm';

export default {
  title: 'Pages/SignupPage/SignupForm',
  component: SignupForm,
} as Meta;

const Template: Story<SignupFormProps> = (props) => (
  <SignupForm {...props} onSubmit={action('onSubmit')} />
);

export const Default = Template.bind({});
Default.args = {};
export const Loading = Template.bind({});
Loading.args = {
  isLoading: true,
};
