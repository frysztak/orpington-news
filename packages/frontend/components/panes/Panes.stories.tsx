import React from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Box, Heading } from '@chakra-ui/react';
import { genN } from '@orpington-news/shared';
import { Panes, PanesProps } from './Panes';
import {
  generateSampleCollection,
  generateSampleCollectionItem,
} from '@components/collection/sampleData';

export default {
  title: 'Components/Panes/Panes',
  component: Panes,
} as Meta;

const Template: Story<PanesProps> = (props) => (
  <Box height="100vh">
    <Panes {...props} />
  </Box>
);

const collection = generateSampleCollection('Fun Blog');
const collectionItems = genN(100).map((_) =>
  generateSampleCollectionItem(collection)
);
const collectionItems2 = genN(2).map((_) =>
  generateSampleCollectionItem(collection)
);

export const Default = Template.bind({});
Default.args = {
  sidebarProps: {
    collections: [],
    onCollectionClicked: action('onCollectionClicked'),
    onChevronClicked: action('onChevronClicked'),
    onMenuItemClicked: action('onMenuItemClicked'),
    activeCollectionId: collection.id,
  },
  collectionItems,
  activeCollection: collection,
};

export const WideSidebar = Template.bind({});
WideSidebar.args = {
  ...Default.args,
  sidebarWidth: 500,
};

export const WideCollectionItems = Template.bind({});
WideCollectionItems.args = {
  ...Default.args,
  collectionItemsWidth: 500,
};

export const FewItems = Template.bind({});
FewItems.args = {
  ...Default.args,
  collectionItems: collectionItems2,
};

export const WithArticle = Template.bind({});
WithArticle.args = {
  ...Default.args,
  collectionItems: collectionItems2,
  mainContent: <Heading>{collectionItems2[0].title}</Heading>,
};
