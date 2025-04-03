import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      'next/core-web-vitals',
      'next/typescript',
      'eslint-config-next',
      'prettier',
    ],
    ignorePatterns: ['.next/**'], // Ignore the .next directory
    settings: {
      next: {
        rootDir: '/',
      },
    },
    rules: {
      'react/jsx-key': [
        'error',
        {
          warnOnDuplicates: true,
        },
      ],
      'import/newline-after-import': [
        'error',
        {
          count: 1,
        },
      ],
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: ['export'],
        },
        {
          blankLine: 'never',
          prev: '*',
          next: 'import',
        },
      ],
      'curly': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
      ],
      'eol-last': ['error', 'always'],
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-assign-module-variable': 'off',
    },
  }),
];

export default eslintConfig;
