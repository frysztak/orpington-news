import React from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
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
  showFilter: 'all',
  collection: {
    id: 90,
    title: 'Fun Blog',
    layout: 'magazine',
  },
  onHamburgerClicked: action('onHamburgerClicked'),
  onMenuActionClicked: action('onMenuActionClicked'),
  onPreferenceChanged: action('onPreferenceChanged'),
};

export const Mobile = Template.bind({});
Mobile.args = {
  ...Default.args,
};
Mobile.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};

export const IsRefreshing = Template.bind({});
IsRefreshing.args = {
  ...Default.args,
  isRefreshing: true,
};

export const IsLoading = Template.bind({});
IsLoading.args = {
  ...Default.args,
  collection: undefined,
};

export const LongTitle = Template.bind({});
LongTitle.args = {
  ...Default.args,
  collection: {
    id: 90,
    title: 'A Very Fun Blog Indeed',
    layout: 'magazine',
  },
};
