-- massive kudos to http://jarnoluu.com/2019/09/12/querying-hierarchical-menu-with-postgresql/ <3
WITH RECURSIVE data AS (
  SELECT
    m.id,
    m.parent_id,
    m.title,
    m.icon,
    m.order,
    m.description,
    m.url,
    m.date_updated,
    m.refresh_interval,
    m.layout,
    m.filter,
    m.grouping,
    m.sort_by,
    m.is_home,
    ARRAY[]::integer[] AS parents,
    0 AS level,
    ARRAY[m.order]::integer[] AS order_path,
    ARRAY[]::integer[] AS children,
    id as root
  FROM
    collections m
  WHERE
    m.is_home IS TRUE
    AND "user_id" = $1
  UNION ALL
  SELECT
    c.id,
    c.parent_id,
    c.title,
    c.icon,
    c.order,
    c.description,
    c.url,
    c.date_updated,
    c.refresh_interval,
    c.layout,
    c.filter,
    c.grouping,
    c.sort_by,
    c.is_home,
    d.parents || c.parent_id,
    d.level + 1,
    d.order_path || c.order,
    d.children,
    d.root
  FROM
    data d
    INNER JOIN collections c ON c.parent_id = d.id
  WHERE
    NOT c.id = ANY (parents)
    AND c. "user_id" = $1
),
roots AS (
  SELECT
    c.id,
    c.id AS root
  FROM
    collections c
  WHERE
    "user_id" = $1
  UNION ALL
  SELECT
    c.id,
    r.root
  FROM
    roots r
    INNER JOIN collections c ON c.parent_id = r.id
),
children AS (
  SELECT DISTINCT
    m.id,
    array_remove(array_agg(r.id), m.id) AS children
  FROM
    roots r
    INNER JOIN collections m ON m.id = r.root
  GROUP BY
    r.root,
    m.id
)
SELECT
  d.id,
  d.title,
  d.icon,
  d.order,
  d.description,
  d.url,
  d.date_updated,
  d.refresh_interval,
  d.layout,
  d.filter,
  d.grouping,
  d.sort_by,
  d.is_home,
  d.level,
  d.order_path,
  d.parents,
  d.parent_id,
  de.children,
  CAST(COALESCE(with_unread_count.unread_count, 0) AS INT4) as unread_count,
  with_parent_order.parent_order,
  d.order = with_max_order.max_order as is_last_child
FROM
  data d
  LEFT JOIN children de ON de.id = d.id
  LEFT JOIN (
    SELECT
      collection_id,
      count(*) as unread_count
    FROM
      collection_items
    WHERE
      date_read IS NULL
    GROUP BY
      collection_id) with_unread_count ON d.id = with_unread_count.collection_id
  LEFT JOIN (
    SELECT
      id,
      "order" as parent_order
    FROM
      collections) with_parent_order ON with_parent_order.id = d.parents[array_length(d.parents, 1)]
  LEFT JOIN (
    SELECT
      parent_id,
      max("order") as max_order
    FROM
      collections
    GROUP BY
      (parent_id)) with_max_order ON with_max_order.parent_id = d.parent_id
ORDER BY
  d.order_path
