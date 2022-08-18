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

export const DropLocationForbidden = Template.bind({});
DropLocationForbidden.args = {
  ...Empty.args,
  collections: sampleFlatCollections,
  expandedCollectionIDs: new Set([3]),
  hoverStatus: {
    status: 'dropLocationForbidden',
    location: 301,
    reason: 'Cannot move a collection inside itself',
  },
};

export const DropLocationChild = Template.bind({});
DropLocationChild.args = {
  ...Empty.args,
  collections: sampleFlatCollections,
  expandedCollectionIDs: new Set([3]),
  hoverStatus: {
    status: 'dropLocationAllowed',
    location: 301,
    logicalPosition: 'child',
  },
};

export const DropLocationBelow = Template.bind({});
DropLocationBelow.args = {
  ...Empty.args,
  collections: sampleFlatCollections,
  expandedCollectionIDs: new Set([3]),
  hoverStatus: {
    status: 'dropLocationAllowed',
    location: 301,
    logicalPosition: 'below',
  },
};

export const DropLocationBelowParent = Template.bind({});
DropLocationBelowParent.args = {
  ...Empty.args,
  collections: sampleFlatCollections,
  expandedCollectionIDs: new Set([3]),
  hoverStatus: {
    status: 'dropLocationAllowed',
    location: 301,
    logicalPosition: 'belowParent',
  },
};
