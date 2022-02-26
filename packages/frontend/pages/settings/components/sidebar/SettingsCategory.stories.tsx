import React from 'react';
import { Meta, Story } from '@storybook/react';
import { SettingsCategory, SettingsCategoryProps } from './SettingsCategory';
import { SettingsLink } from './SettingsLink';

export default {
  title: 'Pages/Settings/Sidebar/SettingsCategory',
  component: SettingsCategory,
} as Meta;

const Template: Story<SettingsCategoryProps> = (props) => (
  <SettingsCategory {...props} />
);

export const Default = Template.bind({});
Default.args = {
  title: 'category',
  children: (
    <>
      <SettingsLink href="/page1">Page 1</SettingsLink>
      <SettingsLink href="/page2">Page 2</SettingsLink>
    </>
  ),
};

export const Active = Template.bind({});
Active.args = {
  ...Default.args,
};
Active.parameters = {
  nextRouter: {
    path: '/page1',
    asPath: '/page1',
  },
};
