DROP TRIGGER IF EXISTS notify_queue ON queue;
DROP TRIGGER IF EXISTS notify_queue_failed ON queue;
DROP FUNCTION IF EXISTS queue_notify_insert;