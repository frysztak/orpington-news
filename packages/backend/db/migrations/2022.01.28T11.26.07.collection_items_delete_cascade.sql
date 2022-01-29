ALTER TABLE collection_items 
DROP CONSTRAINT collections_id_fkey,
ADD CONSTRAINT collections_id_fkey 
  FOREIGN KEY (collection_id) 
  REFERENCES collections (id)
  ON DELETE CASCADE;