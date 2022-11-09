WITH home_collections AS (
  SELECT id FROM collections WHERE is_home = TRUE
)
UPDATE collections
SET parent_id = NULL
FROM home_collections
WHERE collections.parent_id = home_collections.id;

ALTER TABLE "preferences" 
ADD COLUMN IF NOT EXISTS "active_view" text NULL,
ADD COLUMN IF NOT EXISTS "home_collection_layout" text NOT NULL DEFAULT 'card',
ADD COLUMN IF NOT EXISTS "home_collection_filter" text,
ADD COLUMN IF NOT EXISTS "home_collection_grouping" text,
ADD COLUMN IF NOT EXISTS "home_collection_sort_by" text;

UPDATE preferences
SET active_view = 'home',
    active_collection_id = NULL;

DELETE FROM collections
WHERE "is_home" = TRUE;

ALTER TABLE collections
DROP COLUMN "is_home",
DROP COLUMN IF EXISTS "etag";

ALTER TABLE users
DROP COLUMN IF EXISTS "home_id";
