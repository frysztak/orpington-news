import { SlonikMigrator } from '@slonik/migrator';
import { join } from 'path';
import { pool } from './db';

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL not set!`);
}

export const migrator = new SlonikMigrator({
  migrationsPath: join(process.cwd(), '/db/migrations'),
  migrationTableName: 'migration',
  slonik: pool,
  logger: console,
});
