import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { SidebarContent, SidebarContentProps } from './SidebarContent';

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
Default.args = {};

export const WithActiveHome = Template.bind({});
WithActiveHome.args = {
  activeFeedId: 'home',
};

export const WithFeedList = Template.bind({});
WithFeedList.args = {
  activeFeedId: 'feed04',
  feeds: [
    { id: 'feed01', label: 'Feed 01', unreadCount: 9, icon: 'React' },
    {
      id: 'feed02',
      label: 'Feed 02',
      unreadCount: 10,
      icon: 'TypeScript',
      children: [],
    },
    {
      id: 'feed03',
      label: 'Category 01',
      unreadCount: 11,
      children: [
        { id: 'feed03-01', label: 'Feed 03-01', unreadCount: 112 },
        {
          id: 'feed03-02',
          label: 'Category 02',
          unreadCount: 113,
          children: [
            { id: 'feed03-02-01', label: 'Feed 03-02-01', unreadCount: 114 },
          ],
        },
      ],
    },
    { id: 'feed04', label: 'Feed 04', unreadCount: 9 },
  ],
  expandedFeedIDs: ['feed03'],
};
