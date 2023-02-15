import React from 'react';
import { Meta, Story } from '@storybook/react';
import { SidebarFooter, SidebarFooterProps } from './SidebarFooter';

export default {
  title: 'Components/Sidebar/SidebarFooter',
  component: SidebarFooter,
} as Meta;

const Template: Story<SidebarFooterProps> = (props) => (
  <SidebarFooter {...props} />
);

export const Default = Template.bind({});
Default.args = {
  user: {
    displayName: 'Demo 1',
  },
  preferences: {
    avatarStyle: 'initials',
  },
};
