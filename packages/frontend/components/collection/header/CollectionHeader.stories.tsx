import React from 'react';
import { Meta, Story } from '@storybook/react';
import { CollectionHeader, CollectionHeaderProps } from './CollectionHeader';

export default {
  title: 'Components/Collection/Header',
  component: CollectionHeader,
} as Meta;

const Template: Story<CollectionHeaderProps> = (props) => (
  <CollectionHeader {...props} />
);

export const Default = Template.bind({});
Default.args = {
  collection: {
    id: 1,
    title: 'Fun Blog',
    slug: 'fun-blog',
    unreadCount: 9,
  },
};

export const NoMenuButton = Template.bind({});
NoMenuButton.args = {
  ...Default.args,
  hideMenuButton: true,
};

export const NoCollection = Template.bind({});
NoCollection.args = {
  ...Default.args,
  collection: undefined,
};
