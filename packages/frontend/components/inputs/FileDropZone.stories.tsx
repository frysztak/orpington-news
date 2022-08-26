import React from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { FileDropZone, FileDropZoneProps } from './FileDropZone';

export default {
  title: 'Components/Inputs/FileDropZone',
  component: FileDropZone,
} as Meta;

const Template: Story<FileDropZoneProps> = (props) => (
  <FileDropZone {...props} onDrop={action('onDrop')} />
);

export const Default = Template.bind({});
Default.args = {};

export const IsLoading = Template.bind({});
IsLoading.args = {
  isLoading: true,
};
