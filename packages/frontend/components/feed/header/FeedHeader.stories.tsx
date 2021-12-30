import React from 'react';
import { Meta, Story } from '@storybook/react';
import { FeedHeader, FeedHeaderProps } from './FeedHeader';

export default {
  title: 'Components/Feed/Header',
  component: FeedHeader,
} as Meta;

const Template: Story<FeedHeaderProps> = (props) => <FeedHeader {...props} />;

export const Default = Template.bind({});
Default.args = {
  collection: {
    id: 'id01',
    name: 'Fun Blog',
    slug: 'fun-blog',
  },
};

export const NoMenuButton = Template.bind({});
NoMenuButton.args = {
  ...Default.args,
  hideMenuButton: true,
};
