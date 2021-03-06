import { sql } from 'slonik';
import { getUnixTime } from 'date-fns';
import {
  Collection,
  CollectionLayout,
  defaultIcon,
  defaultRefreshInterval,
  ID,
} from '@orpington-news/shared';
import { normalizeUrl } from '@utils';

export const recalculateCollectionsOrder = () => {
  return sql`CALL collections_recalculate_order();`;
};

export const addCollection = (
  collection: Omit<Collection, 'id' | 'unreadCount' | 'children'>,
  userId: ID
) => {
  const {
    title,
    icon,
    parentId,
    description,
    dateUpdated,
    refreshInterval,
    layout,
  } = collection;

  const url = collection.url && normalizeUrl(collection.url);

  const values = [
    userId,
    title,
    icon ?? defaultIcon,
    2147483647, // put new collection at the end
    parentId ?? null,
    description ?? null,
    url ?? null,
    dateUpdated ? getUnixTime(dateUpdated) : null,
    refreshInterval ?? defaultRefreshInterval,
    layout ?? null,
  ];
  return sql`INSERT INTO collections(
    "user_id",
    "title", 
    "icon", 
    "order", 
    "parent_id", 
    "description", 
    "url", 
    "date_updated", 
    "refresh_interval", 
    "layout"
    ) VALUES (${sql.join(values, sql`, `)})`;
};

export const deleteCollection = (collectionId: ID) => {
  return sql<{ id: ID }>`
  DELETE FROM collections 
  WHERE id = ANY(${getCollectionChildrenIds(collectionId)})
  RETURNING id`;
};

export const deleteCollections = (collectionIds: Array<ID>) => {
  return sql<{ id: ID }>`
  DELETE FROM collections
  WHERE id = ANY(${sql.array(collectionIds, 'int4')})
  RETURNING id`;
};

export const updateCollection = (
  collection: Omit<Collection, 'unreadCount' | 'children'>
) => {
  const { id, title, icon, parentId, description, refreshInterval } =
    collection;

  const url = collection.url && normalizeUrl(collection.url);

  return sql`UPDATE collections
  SET title = ${title},
      icon = ${icon ?? defaultIcon},
      parent_id = ${parentId ?? null},
      description = ${description ?? null},
      url = ${url ?? null},
      refresh_interval = ${refreshInterval ?? defaultRefreshInterval}
  WHERE id = ${id}`;
};

export const moveCollections = (
  collectionId: ID,
  newParentId: ID | null,
  newOrder: number
) => {
  return sql`CALL move_collection(${collectionId}, ${newParentId}, ${newOrder})`;
};

export type DBCollection = Omit<
  Collection,
  'children' | 'parentId' | 'dateUpdated' | 'unreadCount' | 'refreshInterval'
> & {
  parents: Array<ID>;
  order: number;
  level: number;
  date_updated: number;
  unread_count: number | null;
  refresh_interval: number;
};

export const getCollectionOwner = (id: ID) => {
  return sql<{ userId: ID }>`
  SELECT "user_id" as "userId"
  FROM collections
  WHERE id = ${id}`;
};

export const getCollections = (userId: ID) => {
  return sql<DBCollection>`
  WITH RECURSIVE collections_from_parents AS (
    SELECT
      id, title, icon, "order", description, url, date_updated, refresh_interval, layout, '{}'::int[] AS parents, 0 AS level
    FROM collections
	  WHERE 
      parent_id IS NULL
      AND "user_id" = ${userId}

    UNION ALL

    SELECT
      c.id, c.title, c.icon, c."order", c.description, c.url, c.date_updated, c.refresh_interval, c.layout, parents || c.parent_id, level + 1
    FROM
      collections_from_parents p
      JOIN collections c ON c.parent_id = p.id
    WHERE
      NOT c.id = ANY (parents)
      AND c."user_id" = ${userId}
  )
SELECT
  id, title, icon, "order", description, url, date_updated, refresh_interval, layout, parents, level, unread_count
FROM
  collections_from_parents
LEFT JOIN (SELECT collection_id, COUNT(*) as unread_count
    FROM collection_items
    WHERE date_read IS NULL
    GROUP BY collection_id) with_unread_count
  ON collections_from_parents.id = with_unread_count.collection_id
ORDER BY level ASC, "order" ASC`;
};

export const getCollectionChildrenIds = (rootId: ID) => {
  return sql<{ children_id: ID }>`
  WITH RECURSIVE tree AS
  (
    SELECT id, '{}'::integer[] AS ancestors FROM collections WHERE parent_id = ${rootId}

    UNION ALL

    SELECT collections.id, tree.ancestors || collections.parent_id
    FROM collections, tree
    WHERE collections.parent_id = tree.id
  )
  SELECT ${rootId} as children_id
  UNION
  SELECT id as children_id FROM tree`;
};

export const getCollectionsToRefresh = () => {
  return sql<DBCollection>`
  SELECT * FROM collections
  WHERE
    url IS NOT NULL
    AND
      (date_updated + refresh_interval * interval '1 minute' <= now()
      OR
      date_updated IS NULL
      );`;
};

export const getCollectionsFromRootId = (rootId: ID) => {
  return sql<DBCollection>`
  SELECT * FROM collections
  WHERE
    url IS NOT NULL
    AND id = ANY(${getCollectionChildrenIds(rootId)})`;
};

export const getCollectionsWithUrl = () => {
  return sql<DBCollection>`
  SELECT * FROM collections
  WHERE url IS NOT NULL`;
};

export const setCollectionDateUpdated = (collectionId: ID, date: number) => {
  return sql`UPDATE collections
  SET date_updated = TO_TIMESTAMP(${date})
  WHERE id = ${collectionId}`;
};

export const hasCollectionWithUrl = (url: string, userId: ID) => {
  return sql`SELECT * FROM collections
  WHERE url = ${url}
    AND "user_id" = ${userId}`;
};

export const markCollectionAsRead = (
  collectionId: ID,
  dateRead: number | null
) => {
  return sql`
  UPDATE collection_items
  SET date_read = TO_TIMESTAMP(${dateRead})
  WHERE collection_id = ANY(${getCollectionChildrenIds(collectionId)})`;
};

export const setCollectionLayout = (
  collectionId: ID,
  layout: CollectionLayout
) => {
  return sql`
  UPDATE collections
  SET layout = ${layout}
  WHERE id = ${collectionId}`;
};
