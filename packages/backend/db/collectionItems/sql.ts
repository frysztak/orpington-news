import { sql } from 'slonik';
import { ID } from '@orpington-news/shared';
import { getCollectionChildrenIds } from '@db/collections';
import { DBCollectionItemDetails, DBCollectionItem } from './types';

type InsertDBCollectionItem = Omit<
  DBCollectionItem,
  'date_read' | 'collection_title' | 'collection_slug' | 'collection_icon'
>;

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
  return sql<Omit<DBCollectionItem, 'full_text'>>`
SELECT collection_items.id,
         collection_items.title,
  	     collection_items.slug,
  	     collection_items.link,
  	     collection_items.summary,
  	     collection_items.thumbnail_url,
  	     collection_items.date_published,
  	     collection_items.date_updated,
  	     collection_items.date_read,
  	     collection_items.categories,
  	     collection_items.comments,
  	     collection_items.reading_time,
         collections.collection_id,
  	     collections.collection_title,
  	     collections.collection_slug,
  	     collections.collection_icon
  FROM collection_items
  INNER JOIN (SELECT id as collection_id, title as collection_title, slug as collection_slug, icon as collection_icon FROM collections) collections
  ON collections.collection_id = collection_items.collection_id
  WHERE collection_items.collection_id = ANY(${getCollectionChildrenIds(
    collectionId
  )})
  ORDER BY date_published DESC`;
};

export const getAllCollectionItems = () => {
  return sql<Omit<DBCollectionItem, 'full_text'>>`
  SELECT collection_items.id,
         collection_items.title,
  	     collection_items.slug,
  	     collection_items.link,
  	     collection_items.summary,
  	     collection_items.thumbnail_url,
  	     collection_items.date_published,
  	     collection_items.date_updated,
  	     collection_items.date_read,
  	     collection_items.categories,
  	     collection_items.comments,
  	     collection_items.reading_time,
         collections.collection_id,
  	     collections.collection_title,
  	     collections.collection_slug,
  	     collections.collection_icon
  FROM collection_items
  INNER JOIN (SELECT id as collection_id, title as collection_title, slug as collection_slug, icon as collection_icon FROM collections) collections
  ON collections.collection_id = collection_items.collection_id
  ORDER BY date_published DESC`;
};

export const getItemDetails = (collectionSlug: string, itemSlug: string) => {
  return sql<DBCollectionItemDetails>`
  SELECT collection_items.*
  FROM collections
  INNER JOIN (SELECT * FROM collection_items) collection_items
  ON collections.id = collection_items.collection_id
  WHERE collections.slug = ${collectionSlug}
   AND collection_items.slug = ${itemSlug}`;
};

export const setItemDateRead = (itemId: string, dateRead: number | null) => {
  return sql`
  UPDATE collection_items
  SET date_read = TO_TIMESTAMP(${dateRead})
  WHERE id = ${itemId}`;
};
