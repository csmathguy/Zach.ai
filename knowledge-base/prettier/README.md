# Prettier Knowledge Base

Prettier is an opinionated code formatter that enforces a consistent style by parsing your code and re-printing it with its own rules. It takes your code and reformats it to ensure consistency across your entire codebase.

## Overview

Prettier removes all original styling and ensures that all outputted code conforms to a consistent style. It supports many languages including JavaScript, TypeScript, JSX, CSS, HTML, JSON, and more.

### Key Benefits

- **Consistency**: Everyone's code looks the same
- **No Style Debates**: Stop discussing formatting in code reviews
- **Time Saving**: Format on save - never think about formatting again
- **Easy to Adopt**: Minimal configuration by design
- **Editor Integration**: Works with all major editors

### Philosophy

> "Prettier is an opinionated code formatter."

This means Prettier intentionally has limited configuration options. The idea is to remove debates about style and let teams focus on what matters: building features.

## Quick Reference

### Essential Commands

```bash
# Format all files
npx prettier . --write

# Check formatting (CI)
npx prettier . --check

# Format specific file/directory
npx prettier src/ --write
npx prettier src/server.ts --write

# Format with glob pattern
npx prettier "app/**/*.test.js" --write
```

### Configuration File

Prettier uses `.prettierrc` (or `.prettierrc.json`, `.prettierrc.js`) in project root.

## Enterprise Best Practices

### 1. Installation Approach

**Critical**: Install an **exact** version locally in every project:

```bash
npm install --save-dev --save-exact prettier
```

**Why exact version?** Even patch releases can change formatting slightly. You don't want team members formatting each other's changes back and forth.

### 2. Minimal Configuration

Prettier is opinionated by design. Recommended enterprise config:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

**Best Practice**: Use defaults whenever possible. Only override when absolutely necessary for your organization.

### 3. Editor Integration

**VS Code**:

1. Install "Prettier - Code formatter" extension (esbenp.prettier-vscode)
2. Configure in settings.json:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 4. CI/CD Integration

```json
// package.json
{
  "scripts": {
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

**In CI pipeline**:

```bash
npm run format:check
```

**Best Practice**: Fail CI if any files aren't formatted. This ensures all committed code is formatted.

### 5. Git Hooks (Pre-commit)

Run Prettier before each commit to ensure all commits are formatted:

```bash
# Install husky and lint-staged
npm install --save-dev husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "**/*": "prettier --write --ignore-unknown"
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

**Note**: If using ESLint, run it **before** Prettier in lint-staged.

### 6. Integration with ESLint

Prettier handles **formatting**, ESLint handles **code quality**. Make them work together:

```bash
npm install --save-dev eslint-config-prettier
```

Add to ESLint config (must be last to override conflicting rules):

```javascript
// eslint.config.mjs
import prettier from 'eslint-config-prettier';

export default [
  // ... other configs
  prettier, // Disables ESLint rules that conflict with Prettier
];
```

## Setup Instructions

### Step 1: Install Prettier

```bash
npm install --save-dev --save-exact prettier
```

### Step 2: Create Configuration

Create `.prettierrc` in project root:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

Or for minimal config (use defaults):

```json
{}
```

### Step 3: Create Ignore File

Create `.prettierignore`:

```
# Dependencies
node_modules/

# Build outputs
dist/
build/
deploy/
coverage/

# IDE
.vscode/
.idea/

# Logs
*.log

# Package manager files
package-lock.json
yarn.lock
pnpm-lock.yaml

# Follow gitignore patterns
```

**Tip**: Prettier will follow `.gitignore` patterns if it exists in the same directory.

### Step 4: Add npm Scripts

```json
{
  "scripts": {
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

### Step 5: Format Everything

```bash
npm run format
```

### Step 6: Set Up Editor

Install Prettier extension and enable format-on-save (see Editor Integration above).

## Configuration Options

### Recommended Enterprise Settings

```json
{
  // Core Options
  "printWidth": 100, // Line length
  "tabWidth": 2, // Indent size
  "useTabs": false, // Use spaces instead of tabs
  "semi": true, // Add semicolons
  "singleQuote": true, // Use single quotes
  "quoteProps": "as-needed", // Only quote props when needed

  // Trailing Commas
  "trailingComma": "es5", // Trailing commas where valid in ES5

  // Brackets
  "bracketSpacing": true, // Spaces in object literals: { foo: bar }
  "bracketSameLine": false, // Put > on new line in JSX
  "arrowParens": "always", // Always parens on arrow functions

  // Other
  "endOfLine": "lf", // Unix line endings
  "proseWrap": "preserve" // Markdown wrapping
}
```

### When to Override Defaults

- **printWidth**: 80 is default, 100 is common for modern monitors
- **singleQuote**: Personal preference, but be consistent
- **trailingComma**: "es5" is safe for older environments, "all" for modern
- **arrowParens**: "always" is more explicit, "avoid" is minimal

## Language-Specific Overrides

```json
{
  "semi": true,
  "singleQuote": true,
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always",
        "printWidth": 80
      }
    },
    {
      "files": "*.json",
      "options": {
        "printWidth": 120
      }
    }
  ]
}
```

## Integration Patterns

### Pattern 1: Prettier + ESLint (Recommended)

- **Prettier**: Code formatting
- **ESLint**: Code quality
- **eslint-config-prettier**: Turn off conflicting ESLint rules

### Pattern 2: Pre-commit Hook

- **lint-staged**: Run on staged files only (fast)
- **husky**: Git hook management
- Run ESLint first, then Prettier

### Pattern 3: CI/CD Pipeline

```yaml
# Example GitHub Actions
- name: Check formatting
  run: npm run format:check
```

### Pattern 4: Editor Only

For small teams, just use editor integration:

- Format on save enabled
- Trust team to have it configured
- Optional: Add format:check to CI as safety net

## Advanced Usage

### Ignore Code Blocks

```javascript
// prettier-ignore
const matrix = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
];

/* prettier-ignore */
const longObject = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 };
```

### Range Formatting

```javascript
// Format specific range
prettier --range-start 0 --range-end 50 file.js
```

### Watch Mode

```bash
# Watch and format on change (requires onchange package)
npm install --save-dev onchange
npx onchange "src/**/*.js" -- prettier --write {{changed}}
```

## Prettier vs ESLint

| Aspect            | Prettier                   | ESLint                                 |
| ----------------- | -------------------------- | -------------------------------------- |
| **Purpose**       | Code formatting            | Code quality                           |
| **Fixes**         | Whitespace, quotes, commas | Logic issues, unused vars, patterns    |
| **Configuration** | Minimal (opinionated)      | Extensive (flexible)                   |
| **Speed**         | Very fast                  | Slower (especially with type-checking) |
| **Auto-fix**      | 100% of issues             | ~50% of issues                         |

**Use Both**: Prettier for formatting, ESLint for catching bugs.

## Troubleshooting

### Common Issues

**Issue**: "No parser could be inferred for file"

- **Solution**: Make sure file extension is supported, or add to `.prettierignore`

**Issue**: Editor not formatting on save

- **Solution**: Check editor has Prettier extension and `editor.formatOnSave: true`

**Issue**: Different formatting between developers

- **Solution**: Ensure everyone has same Prettier version (use exact version in package.json)

**Issue**: Conflicts with ESLint

- **Solution**: Install `eslint-config-prettier` and add to ESLint config

**Issue**: Formatting already-formatted files

- **Solution**: Run `prettier . --write` once to normalize, then commit

## Migration Strategy for Existing Projects

### Step-by-Step Migration

1. **Install Prettier** (exact version)
2. **Add config files** (.prettierrc, .prettierignore)
3. **Format entire codebase**: `prettier . --write`
4. **Commit all formatting changes** (one big commit: "chore: apply Prettier formatting")
5. **Set up pre-commit hooks** to enforce going forward
6. **Configure editors** for all team members
7. **Add CI check** to prevent unformatted code

### Gradual Migration (Optional)

If big-bang formatting is too disruptive:

1. Format files as you touch them
2. Use `.prettierignore` to ignore legacy files
3. Gradually remove files from ignore list
4. Eventually format everything

**Recommendation**: Big-bang is usually easier and cleaner.

## Team Guidelines

### For Enterprise Teams

1. **Lock Prettier version**: Always use exact version
2. **Minimize config**: Use defaults unless strong reason to override
3. **Document overrides**: If you change default, document why
4. **Enforce in CI**: Don't merge unformatted code
5. **Format on commit**: Use git hooks to catch issues early
6. **Editor setup**: Provide team setup guide for VS Code/etc
7. **Onboarding**: Include Prettier setup in new developer onboarding

### Code Review Guidelines

**Before Prettier**:

- "Add spaces here"
- "Use single quotes"
- "Fix indentation"
- "Add trailing comma"

**After Prettier**:

- None of the above! Focus on logic, architecture, and tests.

## References

- [Prettier Official Docs](https://prettier.io/docs/)
- [Playground](https://prettier.io/playground/) - Test formatting online
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
- [Prettier vs Linters](https://prettier.io/docs/comparison)
- [Editor Integration](https://prettier.io/docs/editors)

## Next Steps

- Install and configure ESLint (see [../eslint/README.md](../eslint/README.md))
- Set up Husky and lint-staged for pre-commit hooks
- Configure VS Code settings for team
- Add CI pipeline checks
