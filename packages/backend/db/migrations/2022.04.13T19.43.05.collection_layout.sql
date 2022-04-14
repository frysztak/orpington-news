ALTER TABLE preferences
ADD COLUMN default_collection_layout TEXT NOT NULL DEFAULT 'card';

ALTER TABLE collections
ADD COLUMN layout TEXT;