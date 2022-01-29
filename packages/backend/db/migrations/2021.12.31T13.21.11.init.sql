CREATE TABLE collections (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "icon" text NOT NULL,
  "order" integer NOT NULL,
  "parent_id" integer REFERENCES collections (id) NULL,
  "description" text NULL,
  "url" text NULL,
  "date_updated" timestamptz NULL
);

CREATE TABLE collection_items (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "url" text NOT NULL,
  "summary" text NOT NULL,
  "full_text" text NOT NULL,
  "thumbnail_url" text,
  "date_published" timestamptz NOT NULL,
  "date_updated" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "date_read" timestamptz NULL,
  "categories" text[],
  "comments" text,
  "reading_time" integer NOT NULL
);