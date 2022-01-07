ALTER TABLE collection_items 
DROP CONSTRAINT collections_id_fkey;

ALTER TABLE collection_items
DROP COLUMN collection_id;