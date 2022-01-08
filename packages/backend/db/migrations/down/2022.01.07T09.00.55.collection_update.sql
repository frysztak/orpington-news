ALTER TABLE collections
DROP COLUMN refresh_interval;

ALTER TABLE collection_items
RENAME COLUMN link TO url;

ALTER TABLE collection_items 
ALTER COLUMN date_read DROP DEFAULT;