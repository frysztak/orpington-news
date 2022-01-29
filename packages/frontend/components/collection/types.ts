import { CollectionItem, ID } from '@orpington-news/shared';

export interface CollectionItemProps {
  item: CollectionItem;
}

export interface CollectionLayoutProps {
  title: string;
  collectionItems: CollectionItem[];
}

export const Layouts = ['magazine'] as const;
export type LayoutType = typeof Layouts[number];

export interface ActiveCollection {
  id: string | ID;
  title: string;
}
