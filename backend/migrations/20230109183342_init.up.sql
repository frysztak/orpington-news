CREATE EXTENSION IF NOT EXISTS intarray;

CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
);

ALTER TABLE "session"
DROP CONSTRAINT IF EXISTS "session_pkey";

ALTER TABLE "session"
ADD CONSTRAINT "session_pkey" 
PRIMARY KEY ("sid") 
NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

CREATE TABLE IF NOT EXISTS "users" (
  "id" integer 
    NOT NULL 
    PRIMARY KEY 
    GENERATED ALWAYS as IDENTITY,
  "name" TEXT NOT NULL 
    CONSTRAINT users_name_unique UNIQUE,
  "password" TEXT NOT NULL,
  "email" TEXT NULL,
  "display_name" TEXT NULL,
  "avatar" BYTEA NULL
);

CREATE TABLE IF NOT EXISTS collections (
  "id" integer 
    NOT NULL 
    PRIMARY KEY 
    GENERATED ALWAYS as IDENTITY,
  "parent_id" integer 
    REFERENCES collections (id)
    NULL,
  "user_id" integer 
    NOT NULL
    REFERENCES users (id)
    ON DELETE CASCADE,
  "title" text NOT NULL,
  "icon" text NOT NULL,
  "order" integer NOT NULL,
  "description" text NULL,
  "url" text NULL,
  "date_updated" timestamptz NULL,
  "refresh_interval" integer NOT NULL DEFAULT 60,
  "layout" text
);

CREATE TABLE IF NOT EXISTS collection_items (
  "id" integer 
    NOT NULL
    GENERATED ALWAYS as IDENTITY,
  "collection_id" integer 
    NOT NULL
    REFERENCES collections (id) 
    ON DELETE CASCADE,
  "url" text NOT NULL,
  "title" text NOT NULL,
  "summary" text NOT NULL,
  "full_text" text NOT NULL,
  "thumbnail_url" text,
  "date_published" timestamptz NOT NULL,
  "date_updated" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "date_read" timestamptz NULL DEFAULT NULL,
  "categories" text[],
  "comments" text,
  "reading_time" float4 NOT NULL,
  PRIMARY KEY ("collection_id", "url")
);

CREATE TABLE IF NOT EXISTS preferences (
  "id" integer 
    NOT NULL
    GENERATED ALWAYS as IDENTITY,
  "user_id" integer 
    NOT NULL
    REFERENCES users (id)
    ON DELETE CASCADE,
  "active_view" text NULL,  -- 'home' | 'collection'
  "active_collection_id" integer
    NULL
    REFERENCES collections (id),
  "expanded_collection_ids" integer[],
  "default_collection_layout" text NOT NULL,
  "home_collection_layout" text NOT NULL,
  "avatar_style" text NOT NULL
);

-- make sure that column "order" is in fact in order
CREATE OR REPLACE PROCEDURE collections_recalculate_order() 
LANGUAGE plpgsql
AS $$
DECLARE
  loop_parent_id INT;
BEGIN
  FOR loop_parent_id IN SELECT DISTINCT parent_id FROM collections
    LOOP
	  UPDATE collections c
      SET "order" = c2.new_order - 1
      FROM (SELECT id, row_number() OVER (ORDER BY "order") AS new_order 
            FROM collections c2
            WHERE c2.parent_id IS NOT DISTINCT FROM loop_parent_id
      ) c2
      WHERE c2.id = c.id;
    END LOOP;
END; $$;

CREATE OR REPLACE PROCEDURE move_collection(
  collection_id INT, 
  new_parent_id INT, 
  new_order INT
) LANGUAGE plpgsql
AS $$
BEGIN
  -- make space for moved collection
  UPDATE collections c
    SET "order" = "order" + 1
  WHERE c.parent_id IS NOT DISTINCT FROM new_parent_id
    AND c."order" >= new_order;
	
  -- set new parent
  UPDATE collections 
    SET parent_id = new_parent_id, 
        "order" = new_order
  WHERE id = collection_id;
  
  CALL collections_recalculate_order();
END; $$;

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

ALTER TABLE collections
ADD COLUMN IF NOT EXISTS "filter" TEXT NULL DEFAULT 'all',
ADD COLUMN IF NOT EXISTS "grouping" TEXT NULL DEFAULT 'none',
ADD COLUMN IF NOT EXISTS "sort_by" TEXT NULL;

ALTER TABLE preferences
ADD COLUMN IF NOT EXISTS home_collection_filter TEXT NULL DEFAULT 'all',
ADD COLUMN IF NOT EXISTS home_collection_grouping TEXT NULL DEFAULT 'none',
ADD COLUMN IF NOT EXISTS home_collection_sort_by TEXT NULL;

ALTER TABLE collections
ADD COLUMN IF NOT EXISTS "is_home" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "etag" TEXT NULL DEFAULT NULL;

ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "home_id" INTEGER;

ALTER TABLE "users" 
ALTER COLUMN "home_id" SET NOT NULL;

ALTER TABLE "users"
DROP CONSTRAINT IF EXISTS users_home_id_fkey;

ALTER TABLE "users" 
ADD CONSTRAINT users_home_id_fkey
FOREIGN KEY (home_id)
REFERENCES collections (id)
ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "preferences" 
DROP COLUMN IF EXISTS "active_view",
DROP COLUMN IF EXISTS "home_collection_layout",
DROP COLUMN IF EXISTS "home_collection_filter",
DROP COLUMN IF EXISTS "home_collection_grouping",
DROP COLUMN IF EXISTS "home_collection_sort_by";

ALTER TABLE "collections" 
ALTER COLUMN "sort_by" SET DEFAULT 'newestFirst';

CREATE OR REPLACE FUNCTION get_collection_children_ids(root_collection_id INT) 
RETURNS TABLE(id INT) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE tree AS (
  SELECT
    collections.id,
    '{}'::integer[] AS ancestors
  FROM
    collections
  WHERE
    parent_id = root_collection_id
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
    root_collection_id as id
  UNION
  SELECT
    tree.id
  FROM
    tree;
END; $$;
