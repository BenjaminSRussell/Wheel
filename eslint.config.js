import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import-x';
import promisePlugin from 'eslint-plugin-promise';
import unicornPlugin from 'eslint-plugin-unicorn';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import securityPlugin from 'eslint-plugin-security';
import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';
import perfectionistPlugin from 'eslint-plugin-perfectionist';

const browserGlobals = {
  ...globals.browser,
  ...globals.es2023,
};

const recommendedRules = {
  ...js.configs.recommended.rules,
  ...importPlugin.configs['flat/recommended'].rules,
  ...promisePlugin.configs['flat/recommended'].rules,
  ...unicornPlugin.configs['flat/recommended'].rules,
  ...sonarjsPlugin.configs.recommended.rules,
  ...securityPlugin.configs.recommended.rules,
  ...eslintCommentsPlugin.configs.recommended.rules,
};

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', 'config/.prettierrc.json'],
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: browserGlobals,
    },
    plugins: {
      'import-x': importPlugin,
      promise: promisePlugin,
      unicorn: unicornPlugin,
      sonarjs: sonarjsPlugin,
      security: securityPlugin,
      'eslint-comments': eslintCommentsPlugin,
      perfectionist: perfectionistPlugin,
    },
    rules: {
      ...recommendedRules,
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
      'no-alert': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: false, optionalDependencies: false },
      ],
      'import-x/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
        },
      ],
      'promise/always-return': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-multiple-resolved': 'error',
      'promise/no-return-in-finally': 'error',
      'promise/prefer-await-to-then': 'warn',
      'security/detect-object-injection': 'off',
      'sonarjs/no-duplicate-string': ['warn', { threshold: 3 }],
      'sonarjs/pseudo-random': 'warn',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
            pascalCase: true,
          },
        },
      ],
      'unicorn/numeric-separators-style': 'off',
      'unicorn/no-zero-fractions': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/prefer-query-selector': 'off',
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          newlinesBetween: 'always',
          groups: ['side-effect', 'builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        },
      ],
    },
  },
  eslintConfigPrettier,
];
