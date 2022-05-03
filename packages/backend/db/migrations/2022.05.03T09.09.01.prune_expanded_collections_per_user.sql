CREATE OR REPLACE PROCEDURE preferences_prune_expanded_collections(
  p_user_id INT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- filter out collections that don't have children and therefore cannot be expanded
  UPDATE preferences p
  SET expanded_collection_ids = subquery.ids
  FROM (
    SELECT array_agg(DISTINCT parent_id) as ids
    FROM collections
    WHERE parent_id = ANY(
        SELECT unnest(expanded_collection_ids) 
        FROM preferences
        WHERE "user_id" = p_user_id
    )
  ) as subquery;
END; $$;
