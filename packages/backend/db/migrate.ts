import { SlonikMigrator } from '@slonik/migrator';
import { pool } from './db';

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL not set!`);
}

const migrator = new SlonikMigrator({
  migrationsPath: __dirname + '/migrations',
  migrationTableName: 'migration',
  slonik: pool,
  logger: console,
});

migrator.runAsCLI();
