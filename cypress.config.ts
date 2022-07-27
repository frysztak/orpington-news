import { defineConfig } from 'cypress';
import dotenv from 'dotenv';
import { createPool } from 'slonik';
import { SlonikMigrator } from '@slonik/migrator';
import { join } from 'path';

dotenv.config({ path: '.env.e2e' });

export default defineConfig({
  projectId: '9fra5f',
  env: {
    db_user: process.env.DB_USER,
    db_pass: process.env.DB_PASS,
    db_host: process.env.DB_HOST,
    db_name: process.env.DB_NAME,
    api_url: process.env.NEXT_PUBLIC_API_URL,
    codeCoverage: {
      url: `${process.env.NEXT_PUBLIC_API_URL}/__coverage__`,
    },
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);

      on('task', {
        async 'db:seed'() {
          const buildDSN = (): string => {
            const { db_user, db_pass, db_host, db_name } = config.env;
            return `postgres://${db_user}:${db_pass}@${db_host}/${db_name}`;
          };

          const migrator = new SlonikMigrator({
            migrationsPath: join(
              process.cwd(),
              '/packages/backend/db/migrations'
            ),
            migrationTableName: 'migration',
            slonik: createPool(buildDSN()),
            logger: console,
          });

          await migrator.down({ to: 0 });
          return await migrator.up();
        },
      });

      return config;
    },
  },
});
