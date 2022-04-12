import React from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import faker from '@faker-js/faker';
import { CardItem, CardItemProps } from './CardItem';
import {
  generateSampleCollection,
  generateSampleCollectionItem,
} from '../../sampleData';
import { CollectionItem } from '@orpington-news/shared';

export default {
  title: 'Components/Collection/Layouts/Card',
  component: CardItem,
} as Meta;

const Template: Story<CardItemProps> = (props) => <CardItem {...props} />;

const collection = generateSampleCollection('Fun Blog');
const sampleItem: CollectionItem = generateSampleCollectionItem(collection);

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
