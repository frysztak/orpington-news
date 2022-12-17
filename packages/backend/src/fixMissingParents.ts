import { sql } from 'slonik';
import { pool } from '@db';
import { logger } from '@utils';

/**
 * as a result of a bug in Collection drag-n-drop, in versions <0.11.0
 * it was possible to "disappear" a Collection by dropping it at the very bottom.
 * such Collection had parent_id set to NULL. fix it by setting it back to user's homeId.
 */
export const fixMissingParents = async () => {
  const { rowCount } = await pool.query(sql`
UPDATE
  collections
SET
  parent_id = (
    SELECT
      home_id
    FROM
      "users"
    WHERE
      "users".id = collections.user_id)
WHERE
  parent_id IS NULL
  AND is_home = false
`);

  logger.info(`Fixed missing parent for ${rowCount} collections.`);
};
