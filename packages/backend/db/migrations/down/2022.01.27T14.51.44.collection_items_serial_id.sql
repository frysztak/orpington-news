DROP INDEX IF EXISTS serial_id_index;

ALTER TABLE collection_items 
DROP COLUMN IF EXISTS serial_id;
