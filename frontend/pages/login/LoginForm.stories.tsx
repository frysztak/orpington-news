import React from 'react';
import { Meta, Story } from '@storybook/react';
import { LoginForm, LoginFormProps } from './LoginForm';

export default {
  title: 'Pages/LoginPage/LoginForm',
  component: LoginForm,
} as Meta;

const Template: Story<LoginFormProps> = (props) => <LoginForm {...props} />;

export const Default = Template.bind({});
Default.args = {};
export const Loading = Template.bind({});
Loading.args = {
  isLoading: true,
};
