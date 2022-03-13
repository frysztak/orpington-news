CREATE EXTENSION IF NOT EXISTS intarray;

CREATE TABLE preferences (
  "id" integer UNIQUE PRIMARY KEY default(1),
  CONSTRAINT CHK_preferences_singlerow CHECK (id = 1),
   -- 'home' | 'collection'
  "active_view" text NULL,
  "active_collection_id" integer REFERENCES collections (id) NULL,
  "expanded_collection_ids" integer[]
);

INSERT INTO preferences("active_view", "active_collection_id", "expanded_collection_ids") VALUES ('home', NULL, '{}'::integer[]);

CREATE OR REPLACE PROCEDURE preferences_prune_expanded_collections() 
LANGUAGE plpgsql
AS $$
BEGIN
  -- filter out collections that don't have children and therefore cannot be expanded
  UPDATE preferences p
    SET expanded_collection_ids = subquery.ids
    FROM (
      SELECT array_agg(DISTINCT parent_id) as ids
      FROM collections
      WHERE parent_id = ANY(SELECT unnest(expanded_collection_ids) FROM preferences)
    ) as subquery
    WHERE p.id = 1;
END; $$;