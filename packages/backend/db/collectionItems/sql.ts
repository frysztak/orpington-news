import { sql } from 'slonik';
import { ID } from '@orpington-news/shared';
import { getCollectionChildrenIds } from '@db/collections';
import { DBCollectionItem } from './types';

type InsertDBCollectionItem = Omit<DBCollectionItem, 'date_read'>;

export const insertCollectionItems = (items: Array<InsertDBCollectionItem>) => {
  return sql`
    INSERT INTO collection_items(id, title, slug, link, summary, full_text, thumbnail_url, date_published, date_updated, categories, comments, reading_time, collection_id)
    SELECT id, title, slug, link, summary, full_text, thumbnail_url, TO_TIMESTAMP(date_published) as date_published, TO_TIMESTAMP(date_updated) as date_updated, categories, comments, reading_time, collection_id
    FROM jsonb_to_recordset(${sql.json(
      items
    )}) AS t (id text, title text, slug text, link text, summary text, full_text text, thumbnail_url text, date_published integer, date_updated integer, categories text[], comments text, reading_time float4, collection_id integer)
    ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    link = EXCLUDED.link,
    summary = EXCLUDED.summary,
    full_text = EXCLUDED.full_text,
    thumbnail_url = EXCLUDED.thumbnail_url,
    date_published = GREATEST(collection_items.date_published, EXCLUDED.date_published),
    date_updated = GREATEST(collection_items.date_updated, EXCLUDED.date_updated),
    categories = EXCLUDED.categories,
    comments = EXCLUDED.comments,
    reading_time = EXCLUDED.reading_time
    `;
};

export const getCollectionItems = (collectionId: ID) => {
  return sql<DBCollectionItem>`
  SELECT * from collection_items
  WHERE collection_id = ANY(${getCollectionChildrenIds(collectionId)})`;
};
