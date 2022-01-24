const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@api$': '<rootDir>/api',
    '^@api/(.*)$': '<rootDir>/api/$1',
    '^@components$': '<rootDir>/components',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@features$': '<rootDir>/features',
    '^@features/(.*)$': '<rootDir>/features/$1',
    '^@utils$': '<rootDir>/utils',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
