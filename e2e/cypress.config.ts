import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env.e2e.local' : '.env.e2e',
});

export default defineConfig({
  projectId: '9fra5f',
  env: {
    api_url: process.env.NEXT_PUBLIC_API_URL,
    feeds_url: process.env.FEEDS_URL,
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

      return config;
    },
  },
  retries: {
    runMode: 3,
    openMode: 0,
  },
});
