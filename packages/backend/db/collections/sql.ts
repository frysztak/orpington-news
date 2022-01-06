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

export type DBCollection = Omit<Collection, 'children' | 'parentId'> & {
  parents: Array<ID>;
  order: number;
  level: number;
};

export const getCollections = () => {
  return sql<DBCollection>`
  WITH RECURSIVE collections_from_parents AS (
    SELECT
      id, title, slug, icon, "order", description, url, date_updated, '{}'::int[] AS parents, 0 AS level
    FROM
      collections
    WHERE
      parent_id IS NULL

    UNION ALL

    SELECT
      c.id, c.title, c.slug, c.icon, c."order", c.description, c.url, c.date_updated, parents || c.parent_id, level +1
    FROM
      collections_from_parents p
      JOIN collections c ON c.parent_id = p.id
    WHERE
      NOT c.id = ANY (parents))
  SELECT
    id, title, slug, icon, "order", description, url, date_updated AS "dateUpdated", parents, level, 10 as "unreadCount"
  FROM
    collections_from_parents
  ORDER BY level ASC
  `;
};
