import { Collection } from '@orpington-news/shared';

export type RootCollection = Omit<
  Collection,
  'id' | 'unreadCount' | 'children'
> & {
  children?: Array<RootCollection>;
};

export type FlatCollectionItem = {
  title: string;
  icon: string;
  order: number;
  parentId: number | null;
};
