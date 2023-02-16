import React from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Box, Heading } from '@chakra-ui/react';
import { Panes, PanesProps } from './Panes';

export default {
  title: 'Components/Panes/Panes',
  component: Panes,
} as Meta;

const Template: Story<PanesProps> = (props) => (
  <Box height="100vh">
    <Panes {...props} />
  </Box>
);

const Sidebar = () => {
  return (
    <Box w="full" textAlign="center">
      Sidebar
    </Box>
  );
};

const CollectionListHeader = () => {
  return (
    <Box w="full" fontSize="xl" fontWeight="bold">
      CollectionListHeader
    </Box>
  );
};

const CollectionList = () => {
  return <Box w="full">CollectionList</Box>;
};

export const Horizontal = Template.bind({});
Horizontal.args = {
  layout: 'horizontal',
  sidebar: <Sidebar />,
  collectionItemHeader: <CollectionListHeader />,
  collectionItemList: <CollectionList />,

  onSidebarWidthChanged: action('onSidebarWidthChanged'),
  onCollectionItemsWidthChanged: action('onCollectionItemsWidthChanged'),
  onCollectionItemsHeightChanged: action('onCollectionItemsHeightChanged'),
};

export const WideSidebar = Template.bind({});
WideSidebar.args = {
  ...Horizontal.args,
  sidebarWidth: 500,
};

export const WideCollectionItems = Template.bind({});
WideCollectionItems.args = {
  ...Horizontal.args,
  collectionItemsWidth: 500,
};

export const WithArticle = Template.bind({});
WithArticle.args = {
  ...Horizontal.args,
  mainContent: <Heading>Main content</Heading>,
};

export const Vertical = Template.bind({});
Vertical.args = {
  ...Horizontal.args,
  layout: 'vertical',
};
