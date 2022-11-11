import { sql, SqlSqlToken } from 'slonik';
import { getUnixTime } from 'date-fns';
import {
  AddCollection,
  Collection,
  CollectionPreferences,
  defaultCollectionLayout,
  defaultIcon,
  defaultRefreshInterval,
  ID,
  UpdateCollection,
} from '@orpington-news/shared';
import { EMPTY, MAX_INT, normalizeUrl } from '@utils';

export const recalculateCollectionsOrder = () => {
  return sql`CALL collections_recalculate_order();`;
};

export const addCollection = (collection: AddCollection, userId: ID) => {
  const {
    title,
    icon,
    parentId,
    description,
    dateUpdated,
    refreshInterval,
    layout,
    order,
    isHome,
  } = collection;

  const url = collection.url && normalizeUrl(collection.url);

  const values = [
    userId,
    title,
    icon ?? defaultIcon,
    order ?? MAX_INT, // put new collection at the end
    parentId ?? null,
    description ?? null,
    url ?? null,
    dateUpdated ? getUnixTime(dateUpdated) : null,
    refreshInterval ?? defaultRefreshInterval,
    layout ?? defaultCollectionLayout,
    isHome ?? false,
  ];
  return sql<{ id: ID }>`
INSERT INTO collections (
  "user_id",
  "title",
  "icon",
  "order",
  "parent_id",
  "description",
  "url",
  "date_updated",
  "refresh_interval",
  "layout",
  "is_home")
VALUES (
  ${sql.join(values, sql`, `)})
RETURNING
  id
`;
};

export const getCollectionById = (collectionId: ID) => {
  return sql<DBCollection>`
SELECT
  *
from
  collections
WHERE
  id = ${collectionId}
`;
};

export const deleteCollections = (collectionIds: Array<ID>) => {
  return sql<{ id: ID }>`
DELETE FROM collections
WHERE id = ANY (${sql.array(collectionIds, 'int4')})
RETURNING
  id
`;
};

export const updateCollection = (collection: UpdateCollection) => {
  const { id, title, icon, parentId, description, refreshInterval } =
    collection;

  const url = collection.url && normalizeUrl(collection.url);

  return sql`
UPDATE
  collections
SET
  title = ${title},
  icon = ${icon ?? defaultIcon},
  parent_id = ${parentId ?? null},
  description = ${description ?? null},
  url = ${url ?? null},
  refresh_interval = ${refreshInterval ?? defaultRefreshInterval}
WHERE
  id = ${id}
`;
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
  | 'children'
  | 'parentId'
  | 'dateUpdated'
  | 'unreadCount'
  | 'refreshInterval'
  | 'sortBy'
> & {
  parents: Array<ID>;
  children: Array<ID>;
  order: number;
  order_path: Array<number>;
  parent_order: number | null;
  parent_id: ID | null;
  level: number;
  date_updated: number;
  unread_count: number | null;
  refresh_interval: number;
  is_last_child: boolean;
  sort_by: string | null;
  is_home: boolean;
  etag: string | null;
};

export const getCollectionOwner = (id: ID) => {
  return sql<{ userId: ID }>`
SELECT
  "user_id" as "userId"
FROM
  collections
WHERE
  id = ${id}
`;
};

/*
 * massive kudos to http://jarnoluu.com/2019/09/12/querying-hierarchical-menu-with-postgresql/ <3
 */
export const getCollections = (userId: ID) => {
  return sql<DBCollection>`
WITH RECURSIVE data AS (
  SELECT
    m.id,
    m.parent_id,
    m.title,
    m.icon,
    m.order,
    m.description,
    m.url,
    m.date_updated,
    m.refresh_interval,
    m.layout,
    m.filter,
    m.grouping,
    m.sort_by,
    m.is_home,
    ARRAY[]::integer[] AS parents,
    0 AS level,
    ARRAY[m.order]::integer[] AS order_path,
    ARRAY[]::integer[] AS children,
    id as root
  FROM
    collections m
  WHERE
    m.is_home IS TRUE
    AND "user_id" = ${userId}
  UNION ALL
  SELECT
    c.id,
    c.parent_id,
    c.title,
    c.icon,
    c.order,
    c.description,
    c.url,
    c.date_updated,
    c.refresh_interval,
    c.layout,
    c.filter,
    c.grouping,
    c.sort_by,
    c.is_home,
    d.parents || c.parent_id,
    d.level + 1,
    d.order_path || c.order,
    d.children,
    d.root
  FROM
    data d
    INNER JOIN collections c ON c.parent_id = d.id
  WHERE
    NOT c.id = ANY (parents)
    AND c. "user_id" = ${userId}
),
roots AS (
  SELECT
    c.id,
    c.id AS root
  FROM
    collections c
  WHERE
    "user_id" = ${userId}
  UNION ALL
  SELECT
    c.id,
    r.root
  FROM
    roots r
    INNER JOIN collections c ON c.parent_id = r.id
),
children AS (
  SELECT DISTINCT
    m.id,
    ARRAY_REMOVE(ARRAY_AGG(r.id), m.id) AS children
  FROM
    roots r
    INNER JOIN collections m ON m.id = r.root
  GROUP BY
    r.root,
    m.id
)
SELECT
  d.id,
  d.title,
  d.icon,
  d.order,
  d.description,
  d.url,
  d.date_updated,
  d.refresh_interval,
  d.layout,
  d.filter,
  d.grouping,
  d.sort_by,
  d.is_home,
  d.level,
  d.order_path,
  d.parents,
  d.parent_id,
  de.children,
  with_unread_count.unread_count,
  with_parent_order.parent_order,
  d.order = with_max_order.max_order as is_last_child
FROM
  data d
  LEFT JOIN children de ON de.id = d.id
  LEFT JOIN (
    SELECT
      collection_id,
      COUNT(*) as unread_count
    FROM
      collection_items
    WHERE
      date_read IS NULL
    GROUP BY
      collection_id) with_unread_count ON d.id = with_unread_count.collection_id
  LEFT JOIN (
    SELECT
      id,
      "order" as parent_order
    FROM
      collections) with_parent_order ON with_parent_order.id = d.parents[array_length(d.parents, 1)]
  LEFT JOIN (
    SELECT
      parent_id,
      MAX("order") as max_order
    FROM
      collections
    GROUP BY
      (parent_id)) with_max_order ON with_max_order.parent_id = d.parent_id
ORDER BY
  d.order_path
`;
};

export const getCollectionChildrenIds = (rootId: ID) => {
  return sql<{ id: ID }>`
WITH RECURSIVE tree AS (
  SELECT
    id,
    '{}'::integer[] AS ancestors
  FROM
    collections
  WHERE
    parent_id = ${rootId}
  UNION ALL
  SELECT
    collections.id,
    tree.ancestors || collections.parent_id
  FROM
    collections,
    tree
  WHERE
    collections.parent_id = tree.id
)
SELECT
  ${rootId} as id
UNION
SELECT
  id
FROM
  tree
`;
};

export const getCollectionsToRefresh = () => {
  return sql<DBCollection>`
SELECT
  *
FROM
  collections
WHERE
  url IS NOT NULL
  AND (date_updated + refresh_interval * interval '1 minute' <= now()
    OR date_updated IS NULL);

`;
};

export const getCollectionsFromRootId = (rootId: ID) => {
  return sql<DBCollection>`
SELECT
  *
FROM
  collections
WHERE
  url IS NOT NULL
  AND id = ANY (${getCollectionChildrenIds(rootId)})
`;
};

export const getCollectionsWithUrl = () => {
  return sql<DBCollection>`
SELECT
  *
FROM
  collections
WHERE
  url IS NOT NULL
`;
};

export const setCollectionDateUpdated = (collectionId: ID, date: number) => {
  return sql`
UPDATE
  collections
SET
  date_updated = TO_TIMESTAMP(${date})
WHERE
  id = ${collectionId}
`;
};

export const hasCollectionWithUrl = (url: string, userId: ID) => {
  return sql`
SELECT
  *
FROM
  collections
WHERE
  url = ${url}
  AND "user_id" = ${userId}
`;
};

export const markCollectionAsRead = (
  collectionIds: SqlSqlToken<{ id: ID }>,
  dateRead: number | null
) => {
  return sql`
UPDATE
  collection_items
SET
  date_read = TO_TIMESTAMP(${dateRead})
WHERE
  collection_id = ANY (${collectionIds})
`;
};

interface SetCollectionPreferencesArgs {
  collectionId: ID;
  preferences: CollectionPreferences;
}
export const setCollectionPreferences = ({
  collectionId,
  preferences,
}: SetCollectionPreferencesArgs) => {
  const layout = preferences.layout
    ? sql`layout = ${preferences.layout}`
    : EMPTY;
  const filter = preferences.filter
    ? sql`"filter" = ${preferences.filter}`
    : EMPTY;
  const grouping = preferences.grouping
    ? sql`"grouping" = ${preferences.grouping}`
    : EMPTY;

  return sql`
UPDATE
  collections
SET
  ${layout} ${filter} ${grouping}
WHERE
  id = ${collectionId}
`;
};

export const updateCollectionETag = (collectionId: ID, etag: string) => {
  return sql`
UPDATE
  collections
SET
  etag = ${etag}
WHERE
  id = ${collectionId}
`;
};
