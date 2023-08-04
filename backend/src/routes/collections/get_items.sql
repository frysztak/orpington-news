-- $1 - user_id
-- $2 - collection_id
-- $3 - filter
-- $4 - sort_by
-- $5 - grouping
-- $6 - page_size
-- $7 - offset

WITH children_ids AS (
  SELECT * FROM get_collection_children_ids($2)
)
SELECT
  collection_items.id,
  collection_items.title,
  collection_items.url,
  collection_items.summary,
  collection_items.thumbnail_url,
  collection_items.date_published,
  collection_items.date_updated,
  collection_items.date_read,
  collection_items.full_text,
  collection_items.categories,
  collection_items.comments,
  collection_items.reading_time,
  collections.collection_id,
  collections.collection_title,
  collections.collection_icon
FROM
  children_ids,
  collection_items
  INNER JOIN (
    SELECT
      collections.id as collection_id,
      title as collection_title,
      icon as collection_icon
    FROM
      collections
    WHERE
      "user_id" = $1) collections ON collections.collection_id = collection_items.collection_id
WHERE
  collection_items.collection_id = children_ids.id
  AND
    CASE
      WHEN $3 = 'all' THEN TRUE
      WHEN $3 = 'unread' THEN collection_items.date_read IS NULL
      ELSE collection_items.date_read IS NOT NULL
    END
ORDER BY
  CASE
    WHEN $5 = 'feed' THEN lower(collection_title)
    ELSE 'nope' -- dummy value
  END ASC,
  CASE
    WHEN $4 = 'newestFirst' THEN date_published
  END DESC,
  CASE
    WHEN $4 != 'newestFirst' THEN date_published
  END ASC
LIMIT $6
OFFSET $7

