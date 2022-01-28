ALTER TABLE collection_items 
ADD COLUMN serial_id SERIAL;

CREATE INDEX serial_id_index ON collection_items (serial_id);