import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv'

dotenv.config();

export default defineConfig({
  projectId: '9fra5f',
  env: {
    api_url: process.env.NEXT_PUBLIC_API_URL,
    feeds_url: process.env.FEEDS_URL,
    feeds_url_cypress: process.env.FEEDS_URL_CYPRESS,
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
  video: false
});
