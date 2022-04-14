import { sql } from 'slonik';
import type { ID, Preferences, ViewPreference } from '@orpington-news/shared';

export const pruneExpandedCollections = () => {
  return sql`CALL preferences_prune_expanded_collections();`;
};

export const getPreferences = () => {
  return sql<Preferences>`
    SELECT active_view as "activeView", 
           active_collection_id as "activeCollectionId",
           COALESCE(expanded_collection_ids, '{}') as "expandedCollectionIds",
           default_collection_layout as "defaultCollectionLayout"
    FROM preferences`;
};

export const savePreferences = (preferences: Preferences) => {
  const { defaultCollectionLayout } = preferences;

  return sql`
    UPDATE preferences p
    SET default_collection_layout = ${defaultCollectionLayout}
    WHERE p.id = 1`;
};

export const modifyExpandedCollections = (
  action: 'add' | 'remove',
  collectionId: ID
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
    ) as subquery
    WHERE p.id = 1`;
};

export const setActiveView = (view: ViewPreference) => {
  switch (view.activeView) {
    case 'home':
      return sql`
        UPDATE preferences p
        SET active_view = ${view.activeView},
            active_collection_id = NULL
        WHERE p.id = 1`;
    case 'collection':
      return sql`
        UPDATE preferences p
        SET active_view = ${view.activeView},
            active_collection_id = ${view.activeCollectionId}
        WHERE p.id = 1`;
  }
};
