import React, { useCallback, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { CollectionList, CollectionListProps } from './CollectionList';
import {
  generateSampleCollection,
  generateSampleCollectionItem,
} from '../sampleData';
import { genN } from '@orpington-news/shared';

export default {
  title: 'Components/Collection/List',
  component: CollectionList,
  parameters: { actions: { argTypesRegex: '' } },
} as Meta;

const Template: Story<CollectionListProps> = (props) => (
  <CollectionList {...props} h="80vh" />
);

const collection = generateSampleCollection('Fun Blog');
const items2 = genN(2).map((_) => generateSampleCollectionItem(collection));
const items20 = genN(20).map((_) => generateSampleCollectionItem(collection));
const items100 = genN(100).map((_) => generateSampleCollectionItem(collection));

export const Empty = Template.bind({});
Empty.args = {
  items: { type: 'list', list: [] },
  layout: 'magazine',
};

export const EmptyFetching = Template.bind({});
EmptyFetching.args = {
  items: { type: 'list', list: [] },
  layout: 'magazine',
  isLoading: true,
};

export const TwoItems = Template.bind({});
TwoItems.args = {
  layout: 'magazine',
  items: { type: 'list', list: items2 },
};

export const HundredItems = Template.bind({});
HundredItems.args = {
  layout: 'magazine',
  items: { type: 'list', list: items100 },
};

export const HundredItemsGrouped = Template.bind({});
HundredItemsGrouped.args = {
  layout: 'list',
  items: {
    type: 'group',
    list: [...items20, ...items20],
    groupNames: ['One', 'Two'],
    groupCounts: [20, 20],
  },
};

export const IsFetchingMore = Template.bind({});
IsFetchingMore.args = {
  layout: 'magazine',
  items: { type: 'list', list: items2 },
  canFetchMoreItems: true,
  isFetchingMoreItems: true,
};

export const HundredItemsIsRefreshing = Template.bind({});
HundredItemsIsRefreshing.args = {
  layout: 'magazine',
  items: { type: 'list', list: items100 },
  isRefreshing: true,
};

const FetchTemplate: Story<CollectionListProps> = (props) => {
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState(items2);

  const fetchMoreItems = useCallback(() => {
    action('onFetchMoreItems')();
    function getMore() {
      setIsFetching(true);
      setTimeout(() => {
        const newItems = genN(5).map((_) =>
          generateSampleCollectionItem(collection)
        );
        setItems((items) => [...items, ...newItems]);
        setIsFetching(false);
        setPage((page) => page + 1);
      }, 1000);
    }

    getMore();
  }, []);

  return (
    <CollectionList
      {...props}
      h="80vh"
      isFetchingMoreItems={isFetching}
      canFetchMoreItems={page < 5}
      onFetchMoreItems={fetchMoreItems}
      items={{ type: 'list', list: items }}
    />
  );
};

export const TriggersFetchMore = FetchTemplate.bind({});
TriggersFetchMore.args = {
  layout: 'magazine',
};
