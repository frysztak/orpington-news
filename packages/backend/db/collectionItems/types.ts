import { CollectionIconType, ID } from '@orpington-news/shared';

export interface DBCollectionItem {
  id: ID;
  previous_id: ID;
  next_id: ID;
  url: string;
  title: string;
  full_text: string;
  summary: string;
  thumbnail_url: string | null;
  date_published: number;
  date_updated: number;
  date_read: number | null;
  categories: string[] | null;
  comments: string | null;
  reading_time: number;
  collection_id: ID;
  collection_title: string;
  collection_icon: CollectionIconType;
}

export type DBCollectionItemDetails = Omit<
  DBCollectionItem,
  'collection_title' | 'collection_icon'
>;
