import {
  CollectionGrouping,
  CollectionItem,
  CollectionLayout,
  CollectionFilter,
  ID,
} from '@orpington-news/shared';

export interface CollectionItemProps {
  item: CollectionItem;
  isActive?: boolean;
}

export interface CollectionLayoutProps {
  title: string;
  collectionItems: CollectionItem[];
}

export interface ActiveCollection {
  id: ID | 'home';
  title: string;
  layout: CollectionLayout;
  filter: CollectionFilter;
  grouping: CollectionGrouping;
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
