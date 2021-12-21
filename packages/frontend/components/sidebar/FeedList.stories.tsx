import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Feed, FeedList, FeedListProps } from './FeedList';

export default {
  title: 'Components/Sidebar/FeedList',
  component: FeedList,
} as Meta;

const Template: Story<FeedListProps> = (props) => <FeedList {...props} />;

export const Empty = Template.bind({});
Empty.args = {
  feeds: [],
};

const sampleFeeds: Feed[] = [
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
];

export const SomeFeeds = Template.bind({});
SomeFeeds.args = {
  feeds: sampleFeeds,
};

export const InitialActive = Template.bind({});
InitialActive.args = {
  feeds: sampleFeeds,
  activeFeedId: 'feed04',
};

export const InitialExpanded = Template.bind({});
InitialExpanded.args = {
  feeds: sampleFeeds,
  expandedFeedIDs: ['feed03'],
};
