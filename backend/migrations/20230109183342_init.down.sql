-- omit "session" table
-- DROP TABLE IF EXISTS "session" CASCADE;
-- DROP INDEX IF EXISTS "IDX_session_expire";
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "collections" CASCADE;
DROP TABLE IF EXISTS "collection_items" CASCADE;
DROP TABLE IF EXISTS "preferences" CASCADE;

DROP PROCEDURE IF EXISTS collections_recalculate_order;
DROP PROCEDURE IF EXISTS move_collection;
DROP PROCEDURE IF EXISTS preferences_prune_expanded_collections;
DROP PROCEDURE IF EXISTS preferences_prune_expanded_collections(p_user_id INT);
DROP FUNCTION IF EXISTS get_collection_children_ids(root_collection_id INT);
