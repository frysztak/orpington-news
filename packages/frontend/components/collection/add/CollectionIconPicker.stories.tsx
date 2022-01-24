import React from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import {
  CollectionIconPicker,
  CollectionIconPickerProps,
} from './CollectionIconPicker';
import { Box } from '@chakra-ui/react';

export default {
  title: 'Components/Collection/Add/CollectionIconPicker',
  component: CollectionIconPicker,
} as Meta;

const Template: Story<CollectionIconPickerProps> = (props) => (
  <Box w={64}>
    <CollectionIconPicker
      {...props}
      onIconSelected={action('onIconSelected')}
    />
  </Box>
);

export const Default = Template.bind({});
Default.args = {};

export const InitialValue = Template.bind({});
InitialValue.args = {
  value: 'React',
};
