UPDATE
  preferences p
SET
  expanded_collection_ids = subquery.ids || '{}'
FROM (
  SELECT
    CASE
      WHEN $1 = 'add' THEN
        uniq(array_append(COALESCE(expanded_collection_ids, '{}'::int4[]), $2))
      ELSE
        uniq(array_remove(COALESCE(expanded_collection_ids, '{}'::int4[]), $2))
    END AS ids
  FROM
    preferences
  WHERE
    "user_id" = $3
) as subquery
WHERE
  p.user_id = $3
