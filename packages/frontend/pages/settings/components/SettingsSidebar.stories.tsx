import React from 'react';
import { Meta, Story } from '@storybook/react';
import { SettingsSidebar, SettingsSidebarProps } from './SettingsSidebar';

export default {
  title: 'Pages/Settings/SettingsSidebar',
  component: SettingsSidebar,
} as Meta;

const Template: Story<SettingsSidebarProps> = (props) => (
  <SettingsSidebar {...props} />
);

export const Default = Template.bind({});
Default.args = {};
