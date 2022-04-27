CREATE EXTENSION IF NOT EXISTS intarray;

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
);

ALTER TABLE "session"
ADD CONSTRAINT "session_pkey" 
PRIMARY KEY ("sid") 
NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

CREATE TABLE "users" (
  "id" integer 
    NOT NULL 
    PRIMARY KEY 
    GENERATED ALWAYS as IDENTITY,
  "name" TEXT NOT NULL 
    CONSTRAINT users_name_unique UNIQUE,
  "password" TEXT NOT NULL
);

CREATE TABLE collections (
  "id" integer 
    NOT NULL 
    PRIMARY KEY 
    GENERATED ALWAYS as IDENTITY,
  "parent_id" integer 
    REFERENCES collections (id)
    NULL,
  "user_id" integer 
    NOT NULL
    REFERENCES users (id)
    ON DELETE CASCADE,
  "title" text NOT NULL,
  "icon" text NOT NULL,
  "order" integer NOT NULL,
  "description" text NULL,
  "url" text NULL,
  "date_updated" timestamptz NULL,
  "refresh_interval" integer NOT NULL DEFAULT 60,
  "layout" text
);

CREATE TABLE collection_items (
  "id" integer 
    NOT NULL
    GENERATED ALWAYS as IDENTITY,
  "collection_id" integer 
    NOT NULL
    REFERENCES collections (id) 
    ON DELETE CASCADE,
  "url" text NOT NULL,
  "title" text NOT NULL,
  "summary" text NOT NULL,
  "full_text" text NOT NULL,
  "thumbnail_url" text,
  "date_published" timestamptz NOT NULL,
  "date_updated" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "date_read" timestamptz NULL DEFAULT NULL,
  "categories" text[],
  "comments" text,
  "reading_time" float4 NOT NULL,
  PRIMARY KEY ("collection_id", "url")
);

CREATE INDEX collection_items_id_index ON collection_items (id);

CREATE TABLE preferences (
  "id" integer 
    NOT NULL
    GENERATED ALWAYS as IDENTITY,
  "user_id" integer 
    NOT NULL
    REFERENCES users (id)
    ON DELETE CASCADE,
   -- 'home' | 'collection'
  "active_view" text NULL,
  "active_collection_id" integer
    NULL
    REFERENCES collections (id),
  "expanded_collection_ids" integer[],
  "default_collection_layout" text NOT NULL
);

-- make sure that column "order" is in fact in order
CREATE PROCEDURE collections_recalculate_order() 
LANGUAGE plpgsql
AS $$
DECLARE
  loop_parent_id INT;
BEGIN
  FOR loop_parent_id IN SELECT DISTINCT parent_id FROM collections
    LOOP
	  UPDATE collections c
      SET "order" = c2.new_order - 1
      FROM (SELECT id, row_number() OVER (ORDER BY "order") AS new_order 
            FROM collections c2
            WHERE c2.parent_id IS NOT DISTINCT FROM loop_parent_id
      ) c2
      WHERE c2.id = c.id;
    END LOOP;
END; $$;

CREATE PROCEDURE move_collection(
  collection_id INT, 
  new_parent_id INT, 
  new_order INT
) LANGUAGE plpgsql
AS $$
BEGIN
  -- make space for moved collection
  UPDATE collections c
    SET "order" = "order" + 1
  WHERE c.parent_id IS NOT DISTINCT FROM new_parent_id
    AND c."order" >= new_order;
	
  -- set new parent
  UPDATE collections 
    SET parent_id = new_parent_id, 
        "order" = new_order
  WHERE id = collection_id;
  
  CALL collections_recalculate_order();
END; $$;

CREATE PROCEDURE preferences_prune_expanded_collections() 
LANGUAGE plpgsql
AS $$
BEGIN
  -- filter out collections that don't have children and therefore cannot be expanded
  UPDATE preferences p
    SET expanded_collection_ids = subquery.ids
    FROM (
      SELECT array_agg(DISTINCT parent_id) as ids
      FROM collections
      WHERE parent_id = ANY(SELECT unnest(expanded_collection_ids) FROM preferences)
    ) as subquery;
END; $$;
