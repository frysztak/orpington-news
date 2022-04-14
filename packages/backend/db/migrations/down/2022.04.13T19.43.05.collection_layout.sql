ALTER TABLE preferences
DROP COLUMN IF EXISTS default_collection_layout;

ALTER TABLE collections
DROP COLUMN IF EXISTS layout;