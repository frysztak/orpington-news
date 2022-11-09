import { sql } from 'slonik';
import { z } from 'zod';
import { CollectionPreferences, ID, Preferences } from '@orpington-news/shared';
import { EMPTY } from '@utils';

export const pruneExpandedCollections = (userId: ID) => {
  return sql`CALL preferences_prune_expanded_collections(${userId});`;
};

export const insertPreferences = (
  p: Preferences,
  userId: ID,
  activeCollectionId?: ID
) => {
  const values = [
    userId,
    activeCollectionId ?? null,
    sql.array(p.expandedCollectionIds, 'int4'),
    p.defaultCollectionLayout,
    p.avatarStyle,
  ];

  return sql`
INSERT INTO preferences (
  "user_id",
  "active_collection_id",
  "expanded_collection_ids",
  "default_collection_layout",
  "avatar_style")
VALUES (
  ${sql.join(values, sql`, `)})
`;
};

export const getPreferences = (userId: ID) => {
  return sql.type(Preferences)`
SELECT
  active_collection_id as "activeCollectionId",
  collection_title as "activeCollectionTitle",
  collection_layout as "activeCollectionLayout",
  collection_filter as "activeCollectionFilter",
  collection_grouping as "activeCollectionGrouping",
  collection_sort_by as "activeCollectionSortBy",
  COALESCE(expanded_collection_ids, '{}') as "expandedCollectionIds",
  default_collection_layout as "defaultCollectionLayout",
  avatar_style as "avatarStyle"
FROM
  preferences
LEFT OUTER JOIN (SELECT
  id as collection_id,
  title as collection_title,
  layout as collection_layout,
  "filter" as collection_filter,
  "grouping" as collection_grouping,
  "sort_by" as collection_sort_by
    FROM
      collections) collections ON collections.collection_id = preferences.active_collection_id
WHERE
  "user_id" = ${userId}
`;
};

const SavePreferences = Preferences.pick({
  defaultCollectionLayout: true,
  avatarStyle: true,
});
type SavePreferences = z.infer<typeof SavePreferences>;

export const savePreferences = (p: SavePreferences, userId: ID) => {
  return sql`
UPDATE
  preferences p
SET
  default_collection_layout = ${p.defaultCollectionLayout},
  avatar_style = ${p.avatarStyle}
WHERE
  p.user_id = ${userId}
`;
};

interface SetHomeCollectionPreferencesArgs {
  userId: ID;
  preferences: CollectionPreferences;
}
export const setHomeCollectionPreferences = ({
  userId,
  preferences,
}: SetHomeCollectionPreferencesArgs) => {
  const layout = preferences.layout
    ? sql`home_collection_layout = ${preferences.layout}`
    : EMPTY;
  const filter = preferences.filter
    ? sql`home_collection_filter = ${preferences.filter}`
    : EMPTY;
  const grouping = preferences.grouping
    ? sql`home_collection_grouping = ${preferences.grouping}`
    : EMPTY;

  return sql`
UPDATE
  preferences p
SET
  ${layout} ${filter} ${grouping}
WHERE
  p.user_id = ${userId}
`;
};

export const modifyExpandedCollections = (
  action: 'add' | 'remove',
  collectionId: ID,
  userId: ID
) => {
  const sign = action === 'add' ? sql`+` : sql`-`;
  return sql`
UPDATE
  preferences p
SET
  expanded_collection_ids = subquery.ids || '{}'
FROM (
  SELECT
    uniq (COALESCE(expanded_collection_ids, '{}') ${sign} ${sql.array(
    [collectionId],
    'int4'
  )}) as ids
  FROM
    preferences
  WHERE
    "user_id" = ${userId}) as subquery
WHERE
  p.user_id = ${userId}
`;
};

export const setActiveCollection = (collectionId: ID, userId: ID) => {
  return sql`
UPDATE
  preferences p
SET
  active_collection_id = ${collectionId}
WHERE
  p.user_id = ${userId}
`;
};
