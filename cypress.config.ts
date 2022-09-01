import { defineConfig } from 'cypress';
import dotenv from 'dotenv';
import { createPool } from 'slonik';
import { SlonikMigrator } from '@slonik/migrator';
import { join } from 'path';

dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env.e2e.local' : '.env.e2e',
});

export default defineConfig({
  projectId: '9fra5f',
  env: {
    db_user: process.env.DB_USER,
    db_pass: process.env.DB_PASS,
    db_host: process.env.DB_HOST,
    db_name: process.env.DB_NAME,
    db_port: process.env.DB_PORT,
    api_url: process.env.NEXT_PUBLIC_API_URL,
    feeds_url: process.env.FEEDS_URL,
    codeCoverage: {
      url: `${process.env.NEXT_PUBLIC_API_URL}/__coverage__`,
    },
  },
  e2e: {
    baseUrl: process.env.APP_URL,
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      const buildDSN = (): string => {
        const { db_user, db_pass, db_host, db_name, db_port } = config.env;
        return `postgres://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`;
      };

      on('task', {
        async 'db:seed'() {
          const migrator = new SlonikMigrator({
            migrationsPath: join(
              process.cwd(),
              '/packages/backend/db/migrations'
            ),
            migrationTableName: 'migration',
            slonik: createPool(buildDSN()),
            logger: undefined,
          });

          await migrator.down({ to: 0 });
          return await migrator.up();
        },
      });

      return config;
    },
  },
});
