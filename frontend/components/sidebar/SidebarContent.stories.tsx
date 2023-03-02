import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { defaultIcon, defaultPreferences } from '@shared';
import { SidebarContent, SidebarContentProps } from './SidebarContent';
import { SidebarFooter } from './SidebarFooter';

export default {
  title: 'Components/Sidebar/SidebarContent',
  component: SidebarContent,
} as Meta;

const Template: Story<SidebarContentProps> = (props) => (
  <Box height="100vh">
    <SidebarContent {...props} />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  collections: [],

  footer: (
    <SidebarFooter
      user={{
        username: 'demo',
        displayName: 'Demo 1',
        homeId: 999,
      }}
      preferences={{
        ...defaultPreferences,
        avatarStyle: 'initials',
      }}
    />
  ),
};

export const WithActiveHome = Template.bind({});
WithActiveHome.args = {
  ...Default.args,
  activeCollectionId: 999,
};

export const WithFeedList = Template.bind({});
WithFeedList.args = {
  ...Default.args,
  activeCollectionId: 4,
  collections: [
    { id: 1, title: 'Feed 01', unreadCount: 9, icon: 'React' },
    {
      id: 2,
      title: 'Feed 02',
      unreadCount: 10,
      icon: 'TypeScript',
      children: [],
    },
    {
      id: 3,
      title: 'Category 01',
      unreadCount: 11,
      icon: defaultIcon,
      children: [
        {
          id: 301,
          title: 'Feed 03-01',
          unreadCount: 112,
          icon: defaultIcon,
        },
        {
          id: 302,
          title: 'Category 02',
          unreadCount: 113,
          icon: defaultIcon,
          children: [
            {
              id: 30201,
              title: 'Feed 03-02-01',
              unreadCount: 114,
              icon: defaultIcon,
            },
          ],
        },
      ],
    },
    {
      id: 4,
      title: 'Feed 04',
      unreadCount: 9,

      icon: defaultIcon,
    },
  ],
  expandedCollectionIDs: [3],
};
