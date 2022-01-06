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
Default.args = {
  collections: [],
};

export const WithActiveHome = Template.bind({});
WithActiveHome.args = {
  collections: [],
  activeCollectionId: 'home',
};

export const WithFeedList = Template.bind({});
WithFeedList.args = {
  activeCollectionId: 4,
  collections: [
    { id: 1, title: 'Feed 01', slug: 'feed-01', unreadCount: 9, icon: 'React' },
    {
      id: 2,
      title: 'Feed 02',
      slug: 'feed-02',
      unreadCount: 10,
      icon: 'TypeScript',
      children: [],
    },
    {
      id: 3,
      title: 'Category 01',
      slug: 'category-01',
      unreadCount: 11,
      children: [
        { id: 301, title: 'Feed 03-01', slug: 'feed-03-01', unreadCount: 112 },
        {
          id: 302,
          title: 'Category 02',
          slug: 'feed-03-02',
          unreadCount: 113,
          children: [
            {
              id: 30201,
              title: 'Feed 03-02-01',
              slug: 'feed-03-02-01',
              unreadCount: 114,
            },
          ],
        },
      ],
    },
    { id: 4, title: 'Feed 04', slug: 'feed-04', unreadCount: 9 },
  ],
  expandedCollectionIDs: [3],
};
