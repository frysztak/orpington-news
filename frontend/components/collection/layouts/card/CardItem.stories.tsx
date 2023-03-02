import React from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { CardItem, CardItemProps } from './CardItem';
import {
  generateSampleCollection,
  generateSampleCollectionItem,
} from '../../sampleData';
import { CollectionItem } from '@shared';

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
