# Code Quality Scripts

Quick reference for running code quality checks and formatting.

## Available Scripts

### Type Checking

```bash
npm run typecheck
```

Runs TypeScript compiler checks (`tsc --noEmit`) on both frontend and backend without emitting files. Catches type errors.

### Linting

```bash
# Check for issues
npm run lint

# Check and auto-fix issues
npm run lint:fix
```

Runs ESLint on all JavaScript/TypeScript files. The `--fix` flag automatically fixes issues like unused imports, formatting, etc.

### Formatting

```bash
# Check formatting
npm run format:check

# Format all files
npm run format
```

Runs Prettier to format code consistently. Used in CI to ensure all code follows the same style.

### Complete Validation

```bash
npm run validate
```

Runs all three checks in sequence:

1. TypeScript type checking
2. ESLint with auto-fix
3. Prettier formatting

Use this before committing to ensure code quality.

### Staged Files Only

```bash
npm run validate:staged
```

Runs validation on **staged files only** using lint-staged. This is much faster for large codebases and is the recommended approach for pre-commit hooks.

Runs:

- TypeScript check on staged `.ts` files
- ESLint fix on staged `.js/.ts` files
- Prettier format on staged files

## Pre-commit Workflow

The recommended workflow is:

1. Make your changes
2. Stage files: `git add .`
3. Run validation: `npm run validate:staged`
4. Commit: `git commit -m "your message"`

This ensures only modified files are checked, making the process fast.

## What Each Tool Does

### TypeScript (`tsc`)

- **Purpose**: Type safety
- **Checks**: Type errors, missing types, incompatible types
- **Auto-fix**: No (you must fix manually)
- **Speed**: Fast

### ESLint

- **Purpose**: Code quality and consistency
- **Checks**: Unused variables, potential bugs, style issues
- **Auto-fix**: Yes (many rules, ~50%)
- **Speed**: Medium

### Prettier

- **Purpose**: Code formatting
- **Checks**: Whitespace, quotes, semicolons, line length
- **Auto-fix**: Yes (100% of issues)
- **Speed**: Very fast

## Configuration Files

- **ESLint**: [`eslint.config.mjs`](../eslint.config.mjs)
- **Prettier**: [`.prettierrc`](../.prettierrc)
- **Prettier Ignore**: [`.prettierignore`](../.prettierignore)
- **lint-staged**: Configured in [`package.json`](../package.json)

## Integration with VS Code

Install these extensions:

- **ESLint**: `dbaeumer.vscode-eslint`
- **Prettier**: `esbenp.prettier-vscode`

Configure in `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

This will auto-format and fix ESLint issues on every save.

## CI/CD Integration

In your CI pipeline, run:

```bash
npm run typecheck
npm run lint
npm run format:check
```

This ensures no unformatted or broken code gets merged.

## Troubleshooting

### "Module not found" errors

- Run `npm install` in root, frontend, and backend directories

### ESLint/Prettier conflicts

- Already configured! `eslint-config-prettier` is installed and disables conflicting rules

### Slow validation

- Use `npm run validate:staged` instead of `npm run validate` to only check changed files
- Consider excluding large generated files in `.eslintignore` or `.prettierignore`

### TypeScript errors in Vite

- Vite environment types are in [`frontend/src/vite-env.d.ts`](../frontend/src/vite-env.d.ts)
- Types for `import.meta.env` are defined there

## Next Steps

1. Set up Husky for automated pre-commit hooks
2. Add these checks to your CI/CD pipeline
3. Configure your editor for format-on-save
