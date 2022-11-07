ALTER TABLE collections
ADD COLUMN "is_home" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "etag" TEXT NULL DEFAULT NULL;

ALTER TABLE "users" 
ADD COLUMN "home_id" INTEGER;

WITH user_prefs AS (
  SELECT 
    users.id as "user_id",
    p.home_collection_layout as home_layout
  FROM
    users
    LEFT JOIN preferences p ON p."user_id" = users.id),
inserted_home_collections AS (
  INSERT INTO collections ("parent_id", "user_id", "is_home", "layout", "title", "icon", "order")
  SELECT 
    NULL as "parent_id",
    user_prefs."user_id",
    TRUE as "is_home",
    user_prefs."home_layout",
    'Home' as "title",
    'Code' as "icon",
    0 as "order"
  FROM user_prefs
  RETURNING id, "user_id"
),
updated_collections AS (
  UPDATE collections
  SET parent_id = inserted_home_collections.id
  FROM inserted_home_collections
  WHERE 
    collections."user_id" = inserted_home_collections.user_id 
    AND parent_id IS NULL 
    AND is_home = FALSE
)
UPDATE "users"
SET home_id = inserted_home_collections.id
FROM inserted_home_collections
WHERE 
  "users".id = inserted_home_collections.user_id;

ALTER TABLE "users" 
ALTER COLUMN "home_id" SET NOT NULL;

ALTER TABLE "users" 
ADD CONSTRAINT users_home_id_fkey
FOREIGN KEY (home_id)
REFERENCES collections (id)
ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "preferences" 
DROP COLUMN "active_view",
DROP COLUMN "home_collection_layout",
DROP COLUMN "home_collection_filter",
DROP COLUMN "home_collection_grouping",
DROP COLUMN "home_collection_sort_by";
