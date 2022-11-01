import React from 'react';
import { Meta, Story } from '@storybook/react';
import { AddCollectionForm, AddCollectionFormProps } from './AddCollectionForm';
import { generateSampleCollection, sampleCollections } from '../sampleData';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/Collection/Add/AddCollectionForm',
  component: AddCollectionForm,
} as Meta;

const Template: Story<AddCollectionFormProps> = (props) => (
  <AddCollectionForm
    {...props}
    onVerifyUrlClicked={action('onVerifyUrlClicked')}
    onSubmit={action('onSubmit')}
  />
);

export const Default = Template.bind({});
Default.args = {
  collections: [],
};

export const Loading = Template.bind({});
Loading.args = {
  ...Default.args,
  isLoading: true,
};

const collectionWithChildren = {
  ...generateSampleCollection(),
  children: [
    { ...generateSampleCollection(), children: [generateSampleCollection()] },
  ],
};

export const URLVerified = Template.bind({});
URLVerified.args = {
  ...Default.args,
  isUrlVerified: true,
  collections: sampleCollections,
};

export const Edit = Template.bind({});
Edit.args = {
  ...URLVerified.args,
  initialData: {
    url: 'https://example.com/feed.xml',
    icon: 'HackerNews',
    title: 'Sample Feed',
    description: 'test',
    parentId: sampleCollections[3].id,
    refreshInterval: 30,
    level: 0,
  },
};
