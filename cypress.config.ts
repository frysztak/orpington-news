import { defineConfig } from 'cypress';
import dotenv from 'dotenv';
import axios from 'axios';

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
    //codeCoverage: {
    //  url: `${process.env.NEXT_PUBLIC_API_URL}/__coverage__`,
    //  exclude: ['**/node_modules/**/*'],
    //},
  },
  e2e: {
    baseUrl: process.env.APP_URL,
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);

      on('before:browser:launch', (browser, launchOptions) => {
        const REDUCE = 1;
        if (browser.family === 'firefox') {
          launchOptions.preferences['ui.prefersReducedMotion'] = REDUCE;
        }
        if (browser.family === 'chromium') {
          launchOptions.args.push('--force-prefers-reduced-motion');
        }
        return launchOptions;
      });

      on('task', {
        async 'db:seed'() {
          const { api_url } = config.env;
          await axios.post(`${api_url}/e2e/reset_db`);
          await axios.post(`${api_url}/e2e/setup_db`);

          return true;
        },
      });

      return config;
    },
  },
  retries: {
    runMode: 3,
    openMode: 0,
  },
});
