CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL 
      CONSTRAINT name_unique UNIQUE,
    "password" TEXT NOT NULL
);

ALTER TABLE "collections" 
ADD COLUMN "user_id" INT;

ALTER TABLE "collections" 
ADD CONSTRAINT collections_user_id_fkey 
  FOREIGN KEY ("user_id") 
  REFERENCES "users" (id)
  ON DELETE CASCADE;

ALTER TABLE "preferences" 
ADD COLUMN "user_id" INT;

ALTER TABLE "preferences" 
ADD CONSTRAINT preferences_user_id_fkey 
  FOREIGN KEY ("user_id") 
  REFERENCES "users" (id)
  ON DELETE CASCADE;