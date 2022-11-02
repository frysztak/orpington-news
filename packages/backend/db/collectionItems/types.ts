import { z } from 'zod';
import { CollectionIcons, ID } from '@orpington-news/shared';

export const DBCollectionItem = z.object({
  id: ID,
  previous_id: ID.nullable(),
  next_id: ID.nullable(),
  url: z.string(),
  title: z.string(),
  full_text: z.string(),
  summary: z.string(),
  thumbnail_url: z.string().nullable(),
  date_published: z.number(),
  date_updated: z.number(),
  date_read: z.number().nullable(),
  categories: z.string().array().nullable(),
  comments: z.string().nullable(),
  reading_time: z.number(),
  collection_id: ID,
  collection_title: z.string(),
  collection_icon: CollectionIcons,
});
export type DBCollectionItem = z.infer<typeof DBCollectionItem>;
export const DBCollectionItemWithoutText = DBCollectionItem.omit({
  full_text: true,
});
export type DBCollectionItemWithoutText = z.infer<
  typeof DBCollectionItemWithoutText
>;
