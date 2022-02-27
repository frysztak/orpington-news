DROP PROCEDURE IF EXISTS move_collection(
  collection_id INT, 
  new_parent_id INT, 
  new_order INT
);

DROP PROCEDURE IF EXISTS collections_recalculate_order();