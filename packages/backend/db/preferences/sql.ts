import { sql } from 'slonik';
import { z } from 'zod';
import {
  CollectionLayout,
  ID,
  Preferences,
  ViewPreferences,
} from '@orpington-news/shared';

export const pruneExpandedCollections = (userId: ID) => {
  return sql`CALL preferences_prune_expanded_collections(${userId});`;
};

export const insertPreferences = (p: Preferences, userId: ID) => {
  const values = [
    userId,
    p.activeView,
    null,
    sql.array(p.expandedCollectionIds, 'int4'),
    p.defaultCollectionLayout,
    p.homeCollectionLayout,
    p.avatarStyle,
  ];

  return sql`
INSERT INTO preferences (
  "user_id",
  "active_view",
  "active_collection_id",
  "expanded_collection_ids",
  "default_collection_layout",
  "home_collection_layout",
  "avatar_style")
VALUES (
  ${sql.join(values, sql`, `)})
`;
};

export const getPreferences = (userId: ID) => {
  return sql.type(Preferences)`
SELECT
  active_view as "activeView",
  active_collection_id as "activeCollectionId",
  COALESCE(collection_title, 'Home') as "activeCollectionTitle",
  COALESCE(collection_layout, home_collection_layout) as "activeCollectionLayout",
  COALESCE(expanded_collection_ids, '{}') as "expandedCollectionIds",
  default_collection_layout as "defaultCollectionLayout",
  home_collection_layout as "homeCollectionLayout",
  avatar_style as "avatarStyle"
FROM
  preferences
LEFT OUTER JOIN (SELECT
  id as collection_id,
  title as collection_title,
  layout as collection_layout
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

export const setHomeCollectionLayout = (
  layout: CollectionLayout,
  userId: ID
) => {
  return sql`
UPDATE
  preferences p
SET
  home_collection_layout = ${layout}
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

export const setActiveView = (view: ViewPreferences, userId: ID) => {
  switch (view.activeView) {
    case 'home':
      return sql`
UPDATE
  preferences p
SET
  active_view = ${view.activeView},
  active_collection_id = NULL
WHERE
  p.user_id = ${userId}
`;
    case 'collection':
      /* when activeView is 'collection', activeCollectionId is guaranteed to be set */
      return sql`
UPDATE
  preferences p
SET
  active_view = ${view.activeView},
  active_collection_id = ${view.activeCollectionId!}
WHERE
  p.user_id = ${userId}
`;
  }
};
