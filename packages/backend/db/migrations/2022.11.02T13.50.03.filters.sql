ALTER TABLE collections
ADD COLUMN "filter" TEXT NULL DEFAULT 'all',
ADD COLUMN "grouping" TEXT NULL DEFAULT 'none',
ADD COLUMN "sort_by" TEXT NULL;

ALTER TABLE preferences
ADD COLUMN home_collection_filter TEXT NULL DEFAULT 'all',
ADD COLUMN home_collection_grouping TEXT NULL DEFAULT 'none',
ADD COLUMN home_collection_sort_by TEXT NULL;
