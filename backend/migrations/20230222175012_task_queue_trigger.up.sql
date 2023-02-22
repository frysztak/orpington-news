CREATE OR REPLACE FUNCTION queue_notify_insert ()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$
DECLARE
  channel TEXT := TG_ARGV[0];
BEGIN
  PERFORM (
     WITH payload(id, message) AS
     (
       SELECT NEW.id as id,
              NEW.message as message
    )
     SELECT pg_notify(channel, row_to_json(payload)::TEXT)
       FROM payload
  );
  RETURN NULL;
end;
$$;

CREATE TRIGGER notify_queue
         AFTER INSERT
            ON queue
      FOR EACH ROW
       EXECUTE PROCEDURE queue_notify_insert('queue.new_task');