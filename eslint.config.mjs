// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Apply to JS and TS files
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
  },

  // Ignore build outputs and dependencies
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/deploy/**',
      '**/.vscode/**',
      '**/.git/**',
      '**/coverage/**',
    ],
  },

  // CommonJS files (ecosystem.config.js, jest.config.js, fileMock.js)
  {
    files: ['**/ecosystem.config.js', '**/jest.config.js', '**/__mocks__/**/*.js'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
  },

  // Recommended rules
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // Custom rules
  {
    rules: {
      // Allow console for logging in Node.js backend
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],

      // Underscore prefix for unused variables
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Relax some strict rules for practicality
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },

  // Disable ESLint formatting rules that conflict with Prettier
  prettier
);
