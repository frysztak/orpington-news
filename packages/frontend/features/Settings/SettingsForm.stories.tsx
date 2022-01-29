import React from 'react';
import { Meta, Story } from '@storybook/react';
import { SettingsForm, SettingsFormProps } from './SettingsForm';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Pages/SettingsPage/SettingsForm',
  component: SettingsForm,
} as Meta;

const Template: Story<SettingsFormProps> = (props) => (
  <SettingsForm {...props} onSubmit={action('onSubmit')} />
);

export const Default = Template.bind({});
Default.args = {};
