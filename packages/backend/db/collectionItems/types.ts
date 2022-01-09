import { CollectionIconType, ID } from '@orpington-news/shared';

export interface DBCollectionItem {
  id: string;
  title: string;
  slug: string;
  link: string;
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
  collection_slug: string;
  collection_icon: CollectionIconType;
}
