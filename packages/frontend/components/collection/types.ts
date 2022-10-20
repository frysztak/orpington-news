import { CollectionItem, CollectionLayout, ID } from '@orpington-news/shared';

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
}

export const CollectionLayoutName: Record<CollectionLayout, string> = {
  magazine: 'Magazine',
  card: 'Card',
};
