import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { StatusLine, StatusLineProps } from './StatusLine';

export default {
  title: 'Features/OrganizeCollections/StatusLine',
  component: StatusLine,
} as Meta;

const Template: Story<StatusLineProps> = (props) => (
  <Box w="full" h="full">
    <StatusLine {...props} />
  </Box>
);

export const Default = Template.bind({});
Default.args = {};

export const Error = Template.bind({});
Error.args = {
  error: true,
};

export const PositionBelowParent = Template.bind({});
PositionBelowParent.args = {
  logicalPosition: 'belowParent',
};

export const PositionBelow = Template.bind({});
PositionBelow.args = {
  logicalPosition: 'below',
};

export const PositionChild = Template.bind({});
PositionChild.args = {
  logicalPosition: 'child',
};

export const PositionAbove = Template.bind({});
PositionAbove.args = {
  logicalPosition: 'above',
};
