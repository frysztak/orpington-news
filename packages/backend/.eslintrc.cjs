module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'sql'],
  rules: {
    'sql/format': [
      2,
      {
        ignoreExpressions: false,
        ignoreInline: true,
        ignoreTagless: true,
      },
      {
        spaces: 2,
        commaBreak: true,
      },
    ],
    'sql/no-unsafe-query': [
      2,
      {
        allowLiteral: false,
      },
    ],
  },
};
