const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!(normalize-url|is-relative-url|is-absolute-url|node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)',
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/',
    }),
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  collectCoverage: true,
  coverageDirectory: 'jest-coverage',
};
