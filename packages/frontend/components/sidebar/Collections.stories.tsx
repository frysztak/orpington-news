import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Collections, CollectionsProps } from './Collections';
import { Collection } from '@orpington-news/shared';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/Sidebar/Collections',
  component: Collections,
} as Meta;

const Template: Story<CollectionsProps> = (props) => <Collections {...props} />;

export const Empty = Template.bind({});
Empty.args = {
  collections: [],
  onChevronClicked: action('onChevronClicked'),
  onCollectionClicked: action('onCollectionClicked'),
  onCollectionMenuActionClicked: action('onCollectionMenuActionClicked'),
};

const sampleCollections: Collection[] = [
  { id: 1, name: 'Feed 01', slug: 'feed-01', unreadCount: 9, icon: 'React' },
  {
    id: 2,
    name: 'Feed 02',
    slug: 'feed-02',
    unreadCount: 10,
    icon: 'TypeScript',
    children: [],
  },
  {
    id: 3,
    name: 'Category 01',
    slug: 'category-01',
    unreadCount: 11,
    children: [
      { id: 301, name: 'Feed 03-01', slug: 'feed-03-01', unreadCount: 112 },
      {
        id: 302,
        name: 'Category 02',
        slug: 'feed-03-02',
        unreadCount: 113,
        children: [
          {
            id: 30201,
            name: 'Feed 03-02-01',
            slug: 'feed-03-02-01',
            unreadCount: 114,
          },
        ],
      },
    ],
  },
  { id: 4, name: 'Feed 04', slug: 'feed-04', unreadCount: 9 },
];

export const SomeFeeds = Template.bind({});
SomeFeeds.args = {
  ...Empty.args,
  collections: sampleCollections,
};

export const InitialActive = Template.bind({});
InitialActive.args = {
  ...Empty.args,
  collections: sampleCollections,
  activeCollectionId: 4,
};

export const InitialExpanded = Template.bind({});
InitialExpanded.args = {
  ...Empty.args,
  collections: sampleCollections,
  expandedCollectionIDs: [3],
};
