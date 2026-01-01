# ESLint Knowledge Base

ESLint is a powerful, pluggable linting tool for identifying and reporting on patterns in JavaScript/TypeScript code. It helps maintain code quality, consistency, and catch bugs early in development.

## Overview

ESLint analyzes your code to quickly find problems. It's built into most text editors and you can run ESLint as part of your continuous integration pipeline.

### Key Benefits

- **Catch Bugs Early**: Find problems before they reach production
- **Consistent Code Style**: Enforce coding standards across your team
- **Customizable**: Every rule is a plugin - configure to fit your needs
- **TypeScript Support**: Full support via typescript-eslint
- **Auto-Fix**: Many issues can be fixed automatically

## Quick Reference

### Essential Commands

```bash
# Run ESLint on all files
npx eslint .

# Run with auto-fix
npx eslint . --fix

# Check specific file
npx eslint src/server.ts

# Check and fix specific directory
npx eslint src/ --fix
```

### Configuration File

ESLint uses `eslint.config.mjs` (or `eslint.config.js`) in the project root for configuration.

## Enterprise Best Practices

### 1. Configuration Approach

For enterprise-level projects, use:

- **Recommended baseline**: Start with `@eslint/js` recommended rules
- **TypeScript strict**: Use `typescript-eslint` strict and stylistic configs
- **Consistent versioning**: Lock exact versions in package.json
- **Shared configs**: Create organization-wide shareable configs

### 2. Recommended Rule Sets

#### For TypeScript Projects

```javascript
// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict, // More opinionated, catches more bugs
  tseslint.configs.stylistic // Enforce consistent styling
);
```

#### Key Rule Categories

- **Error Prevention**: `no-unused-vars`, `no-undef`, `no-unreachable`
- **Best Practices**: `eqeqeq`, `curly`, `no-eval`, `no-implicit-globals`
- **TypeScript Specific**: `@typescript-eslint/no-explicit-any`, `@typescript-eslint/strict-boolean-expressions`
- **Style Consistency**: `indent`, `quotes`, `semi`, `comma-dangle`

### 3. Integration with CI/CD

```bash
# In CI pipeline (package.json scripts)
"lint": "eslint .",
"lint:fix": "eslint . --fix",
"lint:ci": "eslint . --max-warnings 0"
```

**Best Practice**: Fail CI builds on any ESLint warnings or errors.

### 4. Editor Integration

- **VS Code**: Install "ESLint" extension (Microsoft or dbaeumer.vscode-eslint)
- **Auto-fix on save**: Configure in VS Code settings:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 5. Git Hooks

Use Husky + lint-staged to run ESLint on staged files before commit:

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,tsx}": "eslint --fix"
  }
}
```

## Setup Instructions

### Step 1: Installation

```bash
npm install --save-dev eslint @eslint/js typescript typescript-eslint
```

### Step 2: Create Configuration

Create `eslint.config.mjs` in project root:

```javascript
// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    files: ['**/*.{js,ts,tsx}'],
    rules: {
      // Custom rule overrides
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
]);
```

### Step 3: Add npm Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### Step 4: Create .eslintignore

```
# Dependencies
node_modules/

# Build outputs
dist/
build/
deploy/

# IDE
.vscode/
.idea/

# Logs
*.log
```

## Common Rules for Enterprise Projects

### Error Level Guide

- `"off"` or `0` - Turn rule off
- `"warn"` or `1` - Warning (doesn't fail build)
- `"error"` or `2` - Error (fails build)

### Recommended Enterprise Rules

```javascript
{
  rules: {
    // Possible Errors
    'no-await-in-loop': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',

    // Best Practices
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-return-await': 'error',
    'require-await': 'error',

    // Variables
    'no-unused-vars': 'off', // Use TypeScript version instead
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    // Stylistic (if not using Prettier)
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'comma-dangle': ['error', 'always-multiline'],

    // TypeScript Specific
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
  }
}
```

## Integration with Prettier

ESLint handles **code quality**, Prettier handles **code formatting**. They work together:

1. Install compatibility package:

```bash
npm install --save-dev eslint-config-prettier
```

2. Add to ESLint config (must be last):

```javascript
import prettier from 'eslint-config-prettier';

export default [
  // ... other configs
  prettier, // Turns off conflicting rules
];
```

## Typed Linting (Advanced)

For maximum type safety, enable rules that require TypeScript type information:

```javascript
export default tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked
);
```

---

## typescript-eslint (MVP)

`typescript-eslint` is the bridge between ESLint and TypeScript. It powers all of our TypeScript-aware linting.

### Why We Use It Here

- Enables ESLint to understand TypeScript syntax and types.
- Provides strict rule sets tuned for TypeScript, catching more bugs early.
- Lets us enforce consistent style (stylistic rules) across `.ts` and `.tsx` files.

### Where It’s Configured

- Installed at the root: see [package.json](../../package.json) (`"typescript-eslint": "8.51.0"`).
- Used in [eslint.config.mjs](../../eslint.config.mjs) via:
  - `import tseslint from 'typescript-eslint';`
  - Combining `tseslint.configs.strict` and `tseslint.configs.stylistic` for our base config.

### How We Use It (MVP)

- Lint all TypeScript and TSX files in frontend and backend via:
  - `npm run lint`
  - `npm run lint:fix`
- Rely on `@typescript-eslint/*` rules for type-aware checks like:
  - No `any` where we want strong typing.
  - No unused vars (with `_`-prefix exceptions).
  - Prefer nullish coalescing and optional chaining.

As we tune rules, this section is the place to document project-specific decisions (e.g., when we relax certain strict rules and why).

**Note**: This is slower but catches more issues using TypeScript's type system.

## Troubleshooting

### Common Issues

**Issue**: "Parsing error: Cannot find module 'typescript'"

- **Solution**: Ensure typescript is installed locally: `npm install --save-dev typescript`

**Issue**: Rules not applying

- **Solution**: Check file patterns in config match your source files

**Issue**: Conflicts with Prettier

- **Solution**: Install `eslint-config-prettier` and add to config

**Issue**: Slow linting

- **Solution**: Avoid typed linting for large projects, or use caching with `--cache` flag

## References

- [ESLint Official Docs](https://eslint.org/docs/latest/)
- [typescript-eslint](https://typescript-eslint.io/)
- [ESLint Rules Reference](https://eslint.org/docs/latest/rules/)
- [Awesome ESLint](https://github.com/dustinspecker/awesome-eslint) - Curated list of configs and plugins

## Next Steps

- Set up Prettier (see [../prettier/README.md](../prettier/README.md))
- Configure pre-commit hooks with Husky
- Add ESLint to CI/CD pipeline
- Create organization-wide shareable config
