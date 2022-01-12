import { sql } from 'slonik';
import { Collection, defaultIcon, ID } from '@orpington-news/shared';
import { slugify } from 'utils/slugify';
import { getUnixTime } from 'date-fns';

export const addCollection = (
  collection: Omit<Collection, 'id' | 'slug' | 'unreadCount' | 'children'>
) => {
  const { title, icon, parentId, description, url, dateUpdated } = collection;

  const values = [
    title,
    slugify(title),
    icon ?? defaultIcon,
    0,
    parentId ?? null,
    description ?? null,
    url ?? null,
    dateUpdated ? getUnixTime(dateUpdated) : null,
  ];
  return sql`INSERT INTO collections("title", "slug", "icon", "order", "parent_id", "description", "url", "date_updated") VALUES (${sql.join(
    values,
    sql`, `
  )})`;
};

export const deleteCollection = (collectionId: ID) => {
  return sql`DELETE FROM collections WHERE id = ${collectionId} OR parent_id = ${collectionId}`;
};

export const updateCollection = (
  collection: Omit<Collection, 'slug' | 'unreadCount' | 'children'>
) => {
  const { id, title, icon, parentId, description, url } = collection;

  return sql`UPDATE collections
  SET title = ${title},
      slug = ${slugify(title)},
      icon = ${icon ?? defaultIcon},
      parent_id = ${parentId ?? null},
      description = ${description ?? null},
      url = ${url ?? null}
  WHERE id = ${id}`;
};

export const moveCollection = (collectionId: ID, newParentId: ID | null) => {
  return sql`UPDATE collections SET parent_id = ${newParentId} WHERE id = ${collectionId}`;
};

export type DBCollection = Omit<
  Collection,
  'children' | 'parentId' | 'dateUpdated' | 'unreadCount'
> & {
  parents: Array<ID>;
  order: number;
  level: number;
  date_updated: number;
  unread_count: number | null;
};

export const getCollections = () => {
  return sql<DBCollection>`
  WITH RECURSIVE collections_from_parents AS (
    SELECT
      id, title, slug, icon, "order", description, url, date_updated, '{}'::int[] AS parents, 0 AS level
    FROM collections
	  WHERE parent_id IS NULL

    UNION ALL

    SELECT
      c.id, c.title, c.slug, c.icon, c."order", c.description, c.url, c.date_updated, parents || c.parent_id, level + 1
    FROM
      collections_from_parents p
      JOIN collections c ON c.parent_id = p.id
    WHERE
      NOT c.id = ANY (parents)
  )
SELECT
  id, title, slug, icon, "order", description, url, date_updated, parents, level, unread_count
FROM
  collections_from_parents
LEFT JOIN (SELECT collection_id, COUNT(date_read IS NULL) as unread_count
           FROM collection_items
           GROUP BY collection_id) with_unread_count
  ON collections_from_parents.id = with_unread_count.collection_id
ORDER BY level ASC, "order" ASC`;
};

export const getCollectionChildrenIds = (rootId: ID) => {
  return sql<{ childrenId: ID }>`
  WITH RECURSIVE tree AS
  (
    SELECT id, '{}'::integer[] AS ancestors FROM collections WHERE parent_id = ${rootId}

    UNION ALL

    SELECT collections.id, tree.ancestors || collections.parent_id
    FROM collections, tree
    WHERE collections.parent_id = tree.id
  )
  SELECT ${rootId} as childrenId
  UNION
  SELECT id as childrenId FROM tree`;
};

export const getCollectionsToRefresh = () => {
  return sql<DBCollection>`
  SELECT * FROM collections
  WHERE
    url IS NOT NULL
    AND
    date_updated + refresh_interval * interval '1 minute' <= now();`;
};

export const setCollectionDateUpdated = (collectionId: ID, date: number) => {
  return sql`UPDATE collections
  SET date_updated = TO_TIMESTAMP(${date})
  WHERE id = ${collectionId}`;
};
