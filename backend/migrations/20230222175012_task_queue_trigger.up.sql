CREATE OR REPLACE FUNCTION queue_notify_insert ()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$
DECLARE
  channel TEXT := TG_ARGV[0];
BEGIN
  IF NEW.failed_attempts < 3 THEN
    PERFORM (
       WITH payload(id, message) AS
       (
         SELECT NEW.id as id,
                NEW.message as message
      )
       SELECT pg_notify(channel, row_to_json(payload)::TEXT)
         FROM payload
    );
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER notify_queue
         AFTER INSERT
            ON queue
      FOR EACH ROW
       EXECUTE PROCEDURE queue_notify_insert('queue.new_task');

CREATE TRIGGER notify_queue_failed
         AFTER UPDATE
            OF failed_attempts
            ON queue
      FOR EACH ROW
       EXECUTE PROCEDURE queue_notify_insert('queue.new_task');