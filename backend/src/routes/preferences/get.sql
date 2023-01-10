SELECT
  active_collection_id,
  collection_title as "active_collection_title",
  collection_layout as "active_collection_layout",
  collection_filter as "active_collection_filter",
  collection_grouping as "active_collection_grouping",
  collection_sort_by as "active_collection_sort_by",
  coalesce(expanded_collection_ids, '{}') as "expanded_collection_ids",
  default_collection_layout as "default_collection_layout",
  avatar_style as "avatar_style"
FROM
  preferences
  LEFT OUTER JOIN (
  SELECT
    id as collection_id,
    title as collection_title,
    layout as collection_layout,
    "filter" as collection_filter,
    "grouping" as collection_grouping,
    "sort_by" as collection_sort_by
  FROM
    collections) collections ON collections.collection_id = preferences.active_collection_id
WHERE
  "user_id" = $1
