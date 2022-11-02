import {
  CollectionGrouping,
  CollectionItem,
  CollectionLayout,
  CollectionShowFilter,
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
  filter: CollectionShowFilter;
  grouping: CollectionGrouping;
}

export const CollectionLayoutName: Record<CollectionLayout, string> = {
  magazine: 'Magazine',
  card: 'Card',
};

export const CollectionShowFilterName: Record<CollectionShowFilter, string> = {
  all: 'All',
  read: 'Read',
  unread: 'Unread',
};
