import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Collections, CollectionsProps } from './Collections';
import {
  Collection,
  defaultIcon,
  defaultRefreshInterval,
} from '@orpington-news/shared';
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
  {
    id: 1,
    title: 'Feed 01',
    unreadCount: 9,
    icon: 'React',
  },
  {
    id: 2,
    title: 'Feed 02',
    unreadCount: 10,
    icon: 'TypeScript',
    children: [],
  },
  {
    id: 3,
    title: 'A Little Bit Longer Category 01',
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
];

export const Error = Template.bind({});
Error.args = {
  ...Empty.args,
  collections: [],
  isError: true,
};

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
