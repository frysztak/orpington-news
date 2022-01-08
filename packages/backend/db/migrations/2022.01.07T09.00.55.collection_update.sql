ALTER TABLE collections
ADD COLUMN refresh_interval integer NOT NULL DEFAULT 60;

ALTER TABLE collection_items
RENAME COLUMN url TO link;

ALTER TABLE collection_items 
ALTER COLUMN id TYPE TEXT;

ALTER TABLE collection_items 
ALTER COLUMN id DROP DEFAULT;

ALTER TABLE collection_items 
ALTER COLUMN date_read SET DEFAULT NULL;

ALTER TABLE collection_items 
ALTER COLUMN reading_time TYPE float4;