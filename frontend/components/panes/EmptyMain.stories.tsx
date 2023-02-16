import React from 'react';
import { Box } from '@chakra-ui/react';
import { Meta, Story } from '@storybook/react';
import { EmptyMain } from './EmptyMain';

export default {
  title: 'Components/Panes/EmptyMain',
  component: EmptyMain,
} as Meta;

const Template: Story = (props) => (
  <Box height="100vh">
    <EmptyMain {...props} />
  </Box>
);

export const Default = Template.bind({});
Default.args = {};
