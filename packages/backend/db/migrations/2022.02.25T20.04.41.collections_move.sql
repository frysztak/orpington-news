CREATE OR REPLACE PROCEDURE move_collection(
  collection_id INT, 
  new_parent_id INT, 
  new_order INT
) LANGUAGE plpgsql
AS $$
DECLARE
  loop_parent_id INT;
BEGIN
  -- make space for moved collection
  UPDATE collections c
    SET "order" = "order" + 1
  WHERE c.parent_id IS NOT DISTINCT FROM new_parent_id
    AND c."order" >= new_order;
	
  -- set new parent
  UPDATE collections 
    SET parent_id = new_parent_id, 
        "order" = new_order
  WHERE id = collection_id;
  
  -- make sure that column "order" is in fact in order
  FOR loop_parent_id IN SELECT DISTINCT parent_id FROM collections
    LOOP
	  UPDATE collections c
      SET "order" = c2.new_order - 1
      FROM (SELECT id, row_number() OVER (ORDER BY "order") AS new_order 
            FROM collections c2
            WHERE c2.parent_id IS NOT DISTINCT FROM loop_parent_id
      ) c2
      WHERE c2.id = c.id;
    END LOOP;
END; $$