import { CollectionItem, CollectionLayout, ID } from '@orpington-news/shared';

export interface CollectionItemProps {
  item: CollectionItem;
}

export interface CollectionLayoutProps {
  title: string;
  collectionItems: CollectionItem[];
}

export interface ActiveCollection {
  id: string | ID;
  title: string;
  layout: CollectionLayout;
}

export const CollectionLayoutName: Record<CollectionLayout, string> = {
  magazine: 'Magazine',
  card: 'Card',
};
