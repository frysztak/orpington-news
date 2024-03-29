import React from 'react';
import { Meta, Story } from '@storybook/react';
import { faker } from '@faker-js/faker';
import { MagazineItem, MagazineItemProps } from './MagazineItem';
import {
  generateSampleCollection,
  generateSampleCollectionItem,
} from '../../sampleData';
import { CollectionItem } from '@shared';

export default {
  title: 'Components/Collection/Layouts/Magazine',
  component: MagazineItem,
} as Meta;

const Template: Story<MagazineItemProps> = (props) => (
  <MagazineItem {...props} />
);

const collection = generateSampleCollection('Fun Blog');
const sampleItem: CollectionItem = generateSampleCollectionItem(collection);

export const Default = Template.bind({});
Default.args = {
  item: {
    ...sampleItem,
  },
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
