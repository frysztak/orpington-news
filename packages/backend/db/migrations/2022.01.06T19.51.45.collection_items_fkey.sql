ALTER TABLE collection_items
ADD COLUMN collection_id integer NOT NULL;

ALTER TABLE collection_items 
ADD CONSTRAINT collections_id_fkey 
FOREIGN KEY (collection_id) 
REFERENCES collections (id);