import React from 'react';
import { Meta, Story } from '@storybook/react';
import { SettingsLink, SettingsLinkProps } from './SettingsLink';

export default {
  title: 'Pages/Settings/SettingsLink',
  component: SettingsLink,
} as Meta;

const Template: Story<SettingsLinkProps> = (props) => (
  <SettingsLink {...props} />
);

export const Default = Template.bind({});
Default.args = {
  href: '#',
  children: <>Link</>,
};

export const Active = Template.bind({});
Active.args = {
  href: '#',
  children: <>Link</>,
};
Active.parameters = {
  nextRouter: {
    path: '#',
    asPath: '#',
  },
};
