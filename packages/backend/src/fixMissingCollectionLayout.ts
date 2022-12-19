import { sql } from 'slonik';
import { pool } from '@db';
import { logger } from '@utils';

/**
 */
export const fixMissingCollectionLayout = async () => {
  const { rowCount } = await pool.query(sql`
UPDATE
  collections
SET
  layout = (
    SELECT
      default_collection_layout
    FROM
      preferences
    WHERE
      preferences.user_id = collections.user_id)
WHERE
  layout IS NULL
`);

  if (rowCount) {
    logger.info(`Fixed missing collection layout for ${rowCount} collections.`);
  }
};
