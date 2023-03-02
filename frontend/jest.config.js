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
    '^@shared$': '<rootDir>/shared',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
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

  collectCoverage: true,
  coverageDirectory: 'jest-coverage',
};

const ignoredModules = ['react-dnd', 'dnd-core', '@react-dnd/*'].join('|');

module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)()),
  transformIgnorePatterns: [`/node_modules/(?!${ignoredModules})`],
});
