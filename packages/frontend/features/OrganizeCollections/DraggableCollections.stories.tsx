import React from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Box } from '@chakra-ui/react';
import {
  DraggableCollections,
  DraggableCollectionsProps,
} from './DraggableCollections';
import { sampleFlatCollections } from '../../components/collection/sampleData';

export default {
  title: 'Features/OrganizeCollections/DraggableCollections',
  component: DraggableCollections,
} as Meta;

const Template: Story<DraggableCollectionsProps> = (props) => (
  <Box ml={32} h={80}>
    <DraggableCollections {...props} />
  </Box>
);

export const Empty = Template.bind({});
Empty.args = {
  collections: [],
  onChevronClicked: action('onChevronClicked'),
  onDnDEvent: action('onDnDEvent'),
};

export const SomeFeeds = Template.bind({});
SomeFeeds.args = {
  ...Empty.args,
  collections: sampleFlatCollections,
  expandedCollectionIDs: new Set([3]),
};

export const RootDropLocationForbidden = Template.bind({});
RootDropLocationForbidden.args = {
  ...Empty.args,
  collections: sampleFlatCollections,
  expandedCollectionIDs: new Set([3]),
  hoverStatus: {
    status: 'dropLocationForbidden',
    location: 2,
    reason: 'Cannot move a collection inside itself',
  },
};

export const DeepDropLocationForbidden = Template.bind({});
DeepDropLocationForbidden.args = {
  ...RootDropLocationForbidden.args,
  hoverStatus: {
    status: 'dropLocationForbidden',
    location: 301,
    reason: 'Cannot move a collection inside itself',
  },
};

export const RootDropLocationChild = Template.bind({});
RootDropLocationChild.args = {
  ...Empty.args,
  collections: sampleFlatCollections,
  expandedCollectionIDs: new Set([3]),
  hoverStatus: {
    status: 'dropLocationAllowed',
    location: 2,
    logicalPosition: 'child',
  },
};

export const DeepDropLocationChild = Template.bind({});
DeepDropLocationChild.args = {
  ...RootDropLocationChild.args,
  hoverStatus: {
    status: 'dropLocationAllowed',
    location: 301,
    logicalPosition: 'child',
  },
};

export const RootDropLocationBelow = Template.bind({});
RootDropLocationBelow.args = {
  ...Empty.args,
  collections: sampleFlatCollections,
  expandedCollectionIDs: new Set([3]),
  hoverStatus: {
    status: 'dropLocationAllowed',
    location: 2,
    logicalPosition: 'below',
  },
};

export const DeepDropLocationBelow = Template.bind({});
DeepDropLocationBelow.args = {
  ...RootDropLocationBelow.args,
  hoverStatus: {
    status: 'dropLocationAllowed',
    location: 301,
    logicalPosition: 'below',
  },
};

export const RootDropLocationBelowParent = Template.bind({});
RootDropLocationBelowParent.args = {
  ...Empty.args,
  collections: sampleFlatCollections,
  expandedCollectionIDs: new Set([3]),
  hoverStatus: {
    status: 'dropLocationAllowed',
    location: 2,
    logicalPosition: 'belowParent',
  },
};

export const DeepDropLocationBelowParent = Template.bind({});
DeepDropLocationBelowParent.args = {
  ...RootDropLocationBelowParent.args,
  hoverStatus: {
    status: 'dropLocationAllowed',
    location: 301,
    logicalPosition: 'belowParent',
  },
};
