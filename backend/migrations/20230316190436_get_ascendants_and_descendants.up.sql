CREATE OR REPLACE FUNCTION get_ascendants_and_descendants(root_collection_ids INT[]) 
RETURNS INT[]
LANGUAGE plpgsql
AS $$
DECLARE                  
  ids int[];
BEGIN
  WITH RECURSIVE
    starting (id, parent_id) AS
    (
      SELECT t.id, t.parent_id
      FROM collections AS t
      WHERE t.id = ANY(root_collection_ids)
    ),
    descendants (id, parent_id) AS
    (
      SELECT s.id, s.parent_id 
      FROM starting AS s
      UNION ALL
      SELECT t.id, t.parent_id 
      FROM collections AS t JOIN descendants AS d ON t.parent_id = d.id
    ),
    ancestors (id, parent_id) AS
    (
      SELECT t.id, t.parent_id 
      FROM collections AS t 
      WHERE t.id IN (SELECT starting.parent_id FROM starting)
      UNION ALL
      SELECT t.id, t.parent_id 
      FROM collections AS t JOIN ancestors AS a ON t.id = a.parent_id
    )
SELECT array_agg(DISTINCT d.id)
FROM (
  TABLE ancestors
  UNION ALL
  TABLE descendants) d
INTO ids;

RETURN ids;
END; $$;

