import React from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { faker } from '@faker-js/faker';
import { ListItem, ListItemProps } from './ListItem';
import {
  generateSampleCollection,
  generateSampleCollectionItem,
} from '../../sampleData';
import { CollectionItem } from '@orpington-news/shared';

export default {
  title: 'Components/Collection/Layouts/List',
  component: ListItem,
} as Meta;

const Template: Story<ListItemProps> = (props) => <ListItem {...props} />;

const collection = generateSampleCollection('Fun Blog');
const sampleItem: CollectionItem = generateSampleCollectionItem(collection);

const longCollection = generateSampleCollection(
  'An Incredibly Fun Blog Indeed'
);
const longSampleItem: CollectionItem =
  generateSampleCollectionItem(longCollection);

export const Default = Template.bind({});
Default.args = {
  item: {
    ...sampleItem,
  },
  onReadingListButtonClicked: action('onReadingListButtonClicked'),
};

export const WithImage = Template.bind({});
WithImage.args = {
  item: {
    ...sampleItem,
    thumbnailUrl: faker.image.cats(),
  },
};

export const Read = Template.bind({});
Read.args = {
  item: {
    ...sampleItem,
    dateRead: 666,
  },
};

export const Active = Template.bind({});
Active.args = {
  item: {
    ...sampleItem,
  },
  isActive: true,
};

export const Long = Template.bind({});
Long.args = {
  item: longSampleItem,
};
