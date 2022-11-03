ALTER TABLE collections
DROP COLUMN "filter",
DROP COLUMN "grouping",
DROP COLUMN "sort_by";

ALTER TABLE preferences
DROP COLUMN home_collection_filter,
DROP COLUMN home_collection_grouping,
DROP COLUMN home_collection_sort_by;