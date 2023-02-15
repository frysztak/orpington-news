import React from 'react';
import { Meta, Story } from '@storybook/react';
import {
  CustomizeAppearance,
  CustomizeAppearanceProps,
} from './CustomizeAppearance';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Pages/Settings/Customize/CustomizeAppearance',
  component: CustomizeAppearance,
} as Meta;

const Template: Story<CustomizeAppearanceProps> = (props) => (
  <CustomizeAppearance {...props} onChange={action('onSubmit')} />
);

export const Default = Template.bind({});
Default.args = {};
