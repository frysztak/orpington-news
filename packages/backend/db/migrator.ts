import { SlonikMigrator } from '@slonik/migrator';
import { join } from 'path';
import { pool } from './db';

export const migrator = new SlonikMigrator({
  migrationsPath: join(process.cwd(), '/db/migrations'),
  migrationTableName: 'migration',
  slonik: pool,
  logger: console,
});
