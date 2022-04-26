import { sql } from 'slonik';
import type { ID, Preferences, ViewPreference } from '@orpington-news/shared';

export const pruneExpandedCollections = () => {
  return sql`CALL preferences_prune_expanded_collections();`;
};

export const insertPreferences = (preferences: Preferences, userId: ID) => {
  const { activeView, expandedCollectionIds, defaultCollectionLayout } =
    preferences;

  const values = [
    activeView,
    null,
    sql.array(expandedCollectionIds, 'int4'),
    defaultCollectionLayout,
    userId,
  ];

  return sql`
    INSERT INTO preferences(
      "active_view", 
      "active_collection_id",
      "expanded_collection_ids", 
      "default_collection_layout", 
      "user_id"
    ) VALUES (${sql.join(values, sql`, `)})`;
};

export const getPreferences = (userId: ID) => {
  return sql<Preferences>`
    SELECT active_view as "activeView", 
           active_collection_id as "activeCollectionId",
           COALESCE(expanded_collection_ids, '{}') as "expandedCollectionIds",
           default_collection_layout as "defaultCollectionLayout"
    FROM preferences
    WHERE "user_id" = ${userId}`;
};

export const savePreferences = (preferences: Preferences, userId: ID) => {
  const { defaultCollectionLayout } = preferences;

  return sql`
    UPDATE preferences p
    SET default_collection_layout = ${defaultCollectionLayout}
    WHERE p.user_id = ${userId}`;
};

export const modifyExpandedCollections = (
  action: 'add' | 'remove',
  collectionId: ID,
  userId: ID
) => {
  const sign = action === 'add' ? sql`+` : sql`-`;
  return sql`
    UPDATE preferences p
    SET expanded_collection_ids = subquery.ids || '{}'
    FROM (
      SELECT uniq(COALESCE(expanded_collection_ids, '{}') ${sign} ${sql.array(
    [collectionId],
    'int4'
  )}) as ids
      FROM preferences
      WHERE "user_id" = ${userId}
    ) as subquery
    WHERE p.user_id = ${userId}`;
};

export const setActiveView = (view: ViewPreference, userId: ID) => {
  switch (view.activeView) {
    case 'home':
      return sql`
        UPDATE preferences p
        SET active_view = ${view.activeView},
            active_collection_id = NULL
        WHERE p.user_id = ${userId}`;
    case 'collection':
      return sql`
        UPDATE preferences p
        SET active_view = ${view.activeView},
            active_collection_id = ${view.activeCollectionId}
        WHERE p.user_id = ${userId}`;
  }
};
