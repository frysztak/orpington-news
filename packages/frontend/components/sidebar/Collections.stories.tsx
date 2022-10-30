import React from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Box } from '@chakra-ui/react';
import { Collections, CollectionsProps } from './Collections';
import { sampleCollections } from '../collection/sampleData';

export default {
  title: 'Components/Sidebar/Collections',
  component: Collections,
} as Meta;

const Template: Story<CollectionsProps> = (props) => (
  <Box height="300px">
    <Collections {...props} />
  </Box>
);

export const Empty = Template.bind({});
Empty.args = {
  collections: [],
  onChevronClicked: action('onChevronClicked'),
  onCollectionClicked: action('onCollectionClicked'),
  onCollectionMenuActionClicked: action('onCollectionMenuActionClicked'),
};

export const Loading = Template.bind({});
Loading.args = {
  ...Empty.args,
  collections: [],
  isLoading: true,
};

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
