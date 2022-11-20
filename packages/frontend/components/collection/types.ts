import {
  CollectionItem,
  CollectionLayout,
  CollectionFilter,
  CollectionGrouping,
  CollectionSortBy,
} from '@orpington-news/shared';

export interface CollectionItemProps {
  item: CollectionItem;
  isActive?: boolean;
}

export interface CollectionLayoutProps {
  title: string;
  collectionItems: CollectionItem[];
}

export const CollectionLayoutName: Record<CollectionLayout, string> = {
  magazine: 'Magazine',
  card: 'Card',
  list: 'List',
};

export const CollectionFilterName: Record<CollectionFilter, string> = {
  all: 'All',
  read: 'Read',
  unread: 'Unread',
};

export const CollectionGroupingName: Record<CollectionGrouping, string> = {
  date: 'Date',
  feed: 'Feed',
  none: 'None',
};

export const CollectionSortByName: Record<CollectionSortBy, string> = {
  newestFirst: 'Newest first',
  oldestFirst: 'Oldest first',
};
