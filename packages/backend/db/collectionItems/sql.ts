import { sql } from 'slonik';
import {
  CollectionFilter,
  CollectionGrouping,
  ID,
} from '@orpington-news/shared';
import { getCollectionChildrenIds } from '@db/collections';
import { TRUE } from '@utils';
import { DBCollectionItem, DBCollectionItemWithoutText } from './types';

type InsertDBCollectionItem = Omit<
  DBCollectionItem,
  | 'id'
  | 'next_id'
  | 'previous_id'
  | 'date_read'
  | 'collection_title'
  | 'collection_icon'
>;

export const insertCollectionItems = (items: Array<InsertDBCollectionItem>) => {
  return sql`
INSERT INTO collection_items (
  "url",
  title,
  summary,
  full_text,
  thumbnail_url,
  date_published,
  date_updated,
  categories,
  comments,
  reading_time,
  collection_id)
SELECT
  "url",
  title,
  summary,
  full_text,
  thumbnail_url,
  TO_TIMESTAMP(date_published) as date_published,
  TO_TIMESTAMP(date_updated) as date_updated,
  categories,
  comments,
  reading_time,
  collection_id
FROM
  jsonb_to_recordset(${sql.jsonb(items)}) AS t ("url" text,
    title text,
    summary text,
    full_text text,
    thumbnail_url text,
    date_published integer,
    date_updated integer,
    categories text[],
    comments text,
    reading_time float4,
    collection_id integer)
ON CONFLICT (collection_id,
  "url")
  DO UPDATE SET
    "url" = EXCLUDED. "url",
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    full_text = EXCLUDED.full_text,
    thumbnail_url = EXCLUDED.thumbnail_url,
    date_published = GREATEST (collection_items.date_published, EXCLUDED.date_published),
    date_updated = GREATEST (collection_items.date_updated, EXCLUDED.date_updated),
    categories = EXCLUDED.categories,
    comments = EXCLUDED.comments,
    reading_time = EXCLUDED.reading_time
`;
};

export interface GetCollectionItemsArgs {
  userId: ID;
  collectionId: ID;
  filter: CollectionFilter;
  grouping: CollectionGrouping;
}

export const getCollectionItems = ({
  userId,
  collectionId,
  filter,
  grouping,
}: GetCollectionItemsArgs) => {
  const showFilter =
    filter === 'all'
      ? TRUE
      : filter === 'unread'
      ? sql`collection_items.date_read IS NULL`
      : sql`collection_items.date_read IS NOT NULL`;

  const orderBy =
    grouping === 'feed'
      ? sql`lower(collection_title) ASC, date_published DESC`
      : sql`date_published DESC`;

  return sql.type(DBCollectionItemWithoutText)`
SELECT
  collection_items.id,
  collection_items.title,
  collection_items.url,
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
  collections.collection_icon
FROM
  collection_items
  INNER JOIN (
    SELECT
      id as collection_id,
      title as collection_title,
      icon as collection_icon
    FROM
      collections WHERE "user_id" = ${userId}) collections ON collections.collection_id = collection_items.collection_id
WHERE
  collection_items.collection_id = ANY (${getCollectionChildrenIds(
    collectionId
  )})
  AND
  ${showFilter}
ORDER BY
  ${orderBy}
`;
};

export const getItemDetails = (collectionId: ID, itemId: ID) => {
  return sql.type(DBCollectionItem)`
SELECT
  articles.*
FROM (
  SELECT
    collection_items.*,
    collections.id as collection_id,
    collections.title as collection_title,
    collections.icon as collection_icon,
    LAG(collection_items.id, 1) OVER (PARTITION BY collection_items.collection_id ORDER BY date_published DESC) previous_id,
    LEAD(collection_items.id, 1) OVER (PARTITION BY collection_items.collection_id ORDER BY date_published DESC) next_id
  FROM collections
  INNER JOIN (
  SELECT
    *
  FROM collection_items) collection_items ON collections.id = collection_items.collection_id
WHERE collections.id = ${collectionId}) articles
WHERE
  articles.id = ${itemId}
`;
};

export const setItemDateRead = (
  collectionId: ID,
  itemId: ID,
  dateRead: number | null
) => {
  return sql`
UPDATE
  collection_items
SET
  date_read = TO_TIMESTAMP(${dateRead})
WHERE
  id = ${itemId}
  AND collection_id = ${collectionId}
`;
};
