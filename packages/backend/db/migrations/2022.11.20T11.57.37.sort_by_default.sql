ALTER TABLE "collections" 
ALTER COLUMN "sort_by" SET DEFAULT 'newestFirst';

UPDATE "collections"
SET "sort_by" = 'newestFirst'
WHERE "sort_by" IS NULL;