import React from 'react';
import { Meta, Story } from '@storybook/react';
import { RefreshIndicator, RefreshIndicatorProps } from './RefreshIndicator';

export default {
  title: 'Components/Collection/RefreshIndicator',
  component: RefreshIndicator,
} as Meta;

const Template: Story<RefreshIndicatorProps> = (props) => (
  <RefreshIndicator {...props} />
);

export const Default = Template.bind({});
Default.args = {};

export const IsRefreshing = Template.bind({});
IsRefreshing.args = {
  isRefreshing: true,
};
