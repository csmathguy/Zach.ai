# GitHub Actions CI/CD Knowledge Base

Comprehensive guide for continuous integration and deployment using GitHub Actions in this TypeScript monorepo.

---

## Table of Contents

- [Overview](#overview)
- [Quick Reference](#quick-reference)
- [Current CI Workflow](#current-ci-workflow)
- [CI/CD Best Practices](#cicd-best-practices)
- [Common CI Issues & Solutions](#common-ci-issues--solutions)
- [Environment Setup](#environment-setup)
- [Testing in CI](#testing-in-ci)
- [Prisma-Specific CI Patterns](#prisma-specific-ci-patterns)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [References](#references)

---

## Overview

GitHub Actions provides CI/CD automation for this monorepo, running quality checks on every push and pull request to ensure code stability before merging.

### Key Benefits

- ✅ **Automated Testing**: All 467 tests run on every push (231 backend + 235 frontend + 1 e2e)
- ✅ **Multi-Version Testing**: Tests on Node.js 20.x (LTS) and 22.x (Current)
- ✅ **Quality Gates**: TypeScript, ESLint, Prettier, Jest, Playwright all must pass
- ✅ **Early Detection**: Catches bugs before they reach production
- ✅ **Consistent Environment**: Ubuntu runners provide clean, reproducible builds

### Workflow Location

- **File**: `.github/workflows/ci.yml`
- **Triggers**: Push to `main`, pull requests to `main`
- **Duration**: ~1-3 minutes typical execution time

---

## Quick Reference

### Essential Commands (Local Pre-CI Testing)

```bash
# Run full validation suite (what CI runs)
npm run verify:all

# Individual checks
npm run typecheck          # TypeScript compilation
npm run lint               # ESLint
npm run format:check       # Prettier
npm test                   # Jest (frontend + backend)
npm run test:e2e           # Playwright

# Fix common issues
npm run lint:fix           # Auto-fix ESLint
npm run format             # Auto-format with Prettier
```

### Pre-Push Checklist

Before pushing commits that will trigger CI:

- [ ] Run `npm run verify:all` locally
- [ ] All tests passing locally (467 total)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Code formatted (`npm run format:check`)
- [ ] Database migrations tested (if applicable)

---

## Current CI Workflow

### Workflow Structure

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  node-ts:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x, 22.x]
```

### Execution Phases

**Phase 1: Environment Setup**

```bash
1. Checkout code (actions/checkout@v4)
2. Setup Node.js (actions/setup-node@v4 with npm cache)
3. Install dependencies (root + frontend + backend)
```

**Phase 2: Quality Checks**

```bash
4. Typecheck (frontend + backend in parallel)
5. Lint (ESLint across entire codebase)
6. Format check (Prettier validation)
```

**Phase 3: Testing**

```bash
7. Unit tests with coverage (frontend)
8. Unit tests with coverage (backend)
   - Includes Jest global setup for database schema
   - DATABASE_URL fallback for CI environment
9. E2E tests (Playwright - Node 20.x only)
```

### Matrix Strategy

**Why test on multiple Node versions?**

- Node 20.x - LTS (Long Term Support), production standard
- Node 22.x - Current release, future-proofing

**Benefits**:

- Ensures compatibility across versions
- Catches version-specific bugs early
- Validates against future Node.js releases

---

## CI/CD Best Practices

### 1. Use `npm ci` Instead of `npm install` in CI

**Current (Good)**:

```yaml
- name: Install dependencies
  run: |
    npm install
    npm install --prefix frontend
    npm install --prefix backend
```

**Best Practice (Better)**:

```yaml
- name: Install dependencies
  run: |
    npm ci
    npm ci --prefix frontend
    npm ci --prefix backend
```

**Why**:

- `npm ci` - Installs from `package-lock.json` exactly, faster, removes `node_modules` first
- `npm install` - Can update lock file, slower, doesn't remove existing modules
- CI should use exact versions for reproducibility

**Status**: Improvement opportunity identified (see work-items/ci-improvements/)

### 2. Cache npm Dependencies

**Current**: Using `cache: npm` in setup-node action ✅

```yaml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node-version }}
    cache: npm # ✅ Good - caches node_modules
```

**Impact**: Reduces `npm install` time from ~30s to ~5s on subsequent runs

### 3. Parallelize Independent Jobs

**Current**: Single job with sequential steps
**Future Improvement**: Separate jobs for faster feedback

```yaml
# Potential optimization (future)
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - run: npm run typecheck

  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - run: npm test --prefix frontend
```

**Trade-off**: More jobs = faster but more complex, uses more runner minutes

### 4. Use Environment Variables Wisely

**Best Practice**: Set env vars at job/step level, not hardcoded

```yaml
# ✅ Good - configured at step level
- name: Run backend tests
  run: npm test --prefix backend
  env:
    NODE_ENV: test
    DATABASE_URL: file:./test.db
```

**Critical for this project**: Backend tests now default DATABASE_URL in `jest.setup.ts` (Fix #4)

### 5. Fast Feedback with Fail-Fast

**Current**: All matrix jobs run to completion
**Best Practice**: Use `fail-fast: false` to see all failures

```yaml
strategy:
  fail-fast: false # Continue other matrix jobs even if one fails
  matrix:
    node-version: [20.x, 22.x]
```

---

## Common CI Issues & Solutions

### Issue 1: Prisma Client Types Not Generated

**Error**:

```
error TS2305: Module '"@prisma/client"' has no exported member 'PrismaClient'.
```

**Root Cause**: Prisma Client not generated after `npm install` in CI

**Solution**: Add `postinstall` hook to `backend/package.json`

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

**Why it works**: `npm install` triggers `postinstall`, generating types before TypeScript compilation

**Reference**: Prisma docs recommend this for CI/CD environments

---

### Issue 2: Database Schema Not Applied to Test Database

**Error**:

```
SQLITE_ERROR: no such table: main.users
```

**Root Cause**: Tests run before schema applied to SQLite database

**Wrong Solution** (Timing issue):

```json
{
  "scripts": {
    "test:ci": "prisma db push && jest"
  }
}
```

❌ This applies schema to `DATABASE_URL`, but tests import PrismaClient singleton which runs before seeing schema

**Correct Solution**: Jest global setup

```typescript
// backend/jest.setup.ts
export default async function globalSetup() {
  console.log('🔧 Applying database schema for tests...');

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./dev.db?journal_mode=WAL';
  }

  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    cwd: __dirname,
    env: process.env,
  });

  console.log('✅ Database schema applied successfully');
}
```

```javascript
// backend/jest.config.js
module.exports = {
  globalSetup: '<rootDir>/jest.setup.ts',
  // ...
};
```

**Why it works**: Global setup runs BEFORE any test files are loaded, ensuring schema exists before PrismaClient singleton is created

---

### Issue 3: SQLite Database Locking Timeouts

**Error**:

```
Error: Operation has timed out
```

**Root Cause**: Multiple Jest workers trying to write to same SQLite file simultaneously

**Solution**: Serialize test execution with `maxWorkers: 1`

```javascript
// backend/jest.config.js
module.exports = {
  maxWorkers: 1, // Critical for SQLite file-based locking
  // ...
};
```

**Don't override in npm scripts**:

```json
{
  "scripts": {
    "test:ci": "jest --ci --coverage" // ✅ Respects jest.config.js
    // ❌ BAD: "jest --maxWorkers=2"  // Would override config
  }
}
```

**Why**: SQLite with file-based databases cannot handle concurrent writers (WAL mode helps but doesn't eliminate locking)

---

### Issue 4: DATABASE_URL Not Set in CI Environment

**Error**:

```
Error: The datasource.url property is required in your Prisma config file when using prisma db push.
```

**Root Cause**: GitHub Actions runners don't have `DATABASE_URL` environment variable set by default

**Solution**: Fallback in Jest global setup

```typescript
// backend/jest.setup.ts
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db?journal_mode=WAL';
  console.log('📌 DATABASE_URL not set, using default: file:./dev.db');
}

execSync('npx prisma db push --accept-data-loss', {
  stdio: 'inherit',
  cwd: __dirname,
  env: process.env, // Critical: pass env to child process
});
```

**Why it works**: SQLite creates `.db` file automatically if doesn't exist, no need to commit database files to repo

**Git Best Practice**: Database files (`.db`, `.db-shm`, `.db-wal`) MUST be gitignored, CI creates them from schema

---

## Environment Setup

### CI Environment Characteristics

**GitHub Actions Ubuntu Runners**:

- **OS**: Ubuntu Latest (22.04 as of 2026)
- **Node.js**: Specified via matrix (20.x, 22.x)
- **npm**: Comes with Node.js (v10+ typically)
- **Clean State**: Every run starts fresh, no persistent data
- **Working Directory**: `/home/runner/work/<repo>/<repo>`

**Environment Variables Available**:

- `CI=true` - Automatically set by GitHub Actions
- `GITHUB_*` - Workflow context (SHA, ref, actor, etc.)
- `NODE_ENV` - NOT set by default, set explicitly if needed

**Environment Variables NOT Set**:

- `DATABASE_URL` - Must provide fallback or set in workflow
- Custom app-specific vars - Set in workflow or repository secrets

### Setting Environment Variables

**Workflow-level** (all jobs):

```yaml
env:
  NODE_ENV: test
```

**Job-level** (specific job):

```yaml
jobs:
  test:
    env:
      DATABASE_URL: file:./test.db
```

**Step-level** (specific step):

```yaml
- name: Run tests
  run: npm test
  env:
    LOG_LEVEL: debug
```

**From secrets** (sensitive data):

```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
```

---

## Testing in CI

### Test Execution Order

1. **Frontend Tests** - jsdom environment, React Testing Library
2. **Backend Tests** - Node environment, Supertest for API
3. **E2E Tests** - Playwright (Chromium only, Node 20.x only)

### Test Coverage Requirements

- **Threshold**: 70% minimum (branches, functions, lines, statements)
- **Enforcement**: Jest config, CI fails if below threshold
- **Current Status**: Passing (231 backend + 235 frontend = 467 total)

### Coverage Artifacts

**Coverage is generated but NOT uploaded as artifacts** (opportunity for improvement)

**Future Enhancement**:

```yaml
- name: Upload coverage reports
  uses: actions/upload-artifact@v4
  with:
    name: coverage-reports
    path: |
      frontend/coverage/
      backend/coverage/
```

**Benefits**: View coverage reports without local run, track coverage over time

---

## Prisma-Specific CI Patterns

### Prisma Client Generation

**Critical**: Always generate Prisma Client after `npm install`

**Method 1 - postinstall Hook (Recommended for CI)**:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

**Method 2 - Explicit Step (More visible)**:

```yaml
- name: Generate Prisma Client
  run: npm run prisma:generate --prefix backend
```

**Why postinstall is preferred**: Automatic, works in all environments (CI, local, Docker)

### Database Initialization in CI

**Pattern**: Use Jest global setup for test database initialization

**Do**:

- ✅ Apply schema via `prisma db push` in global setup
- ✅ Use in-memory or temporary file-based SQLite
- ✅ Provide DATABASE_URL fallback
- ✅ Set `maxWorkers: 1` for SQLite

**Don't**:

- ❌ Commit `.db` files to repository
- ❌ Run `prisma migrate` in CI (migrations tested separately)
- ❌ Assume DATABASE_URL is set
- ❌ Use concurrent workers with file-based SQLite

### Prisma Commands Reference

```bash
# Generate Prisma Client (types)
npx prisma generate

# Apply schema without migrations (dev/test)
npx prisma db push --accept-data-loss

# Run migrations (production)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Validate schema file
npx prisma validate
```

---

## Performance Optimization

### Current Performance

**Typical CI Run**: 1-3 minutes total

- Setup: ~20s (checkout, Node.js setup, npm install with cache)
- Quality Checks: ~30s (typecheck, lint, format check)
- Tests: ~40s (frontend + backend + e2e)
- Matrix Overhead: Runs twice (Node 20.x + 22.x)

### Optimization Opportunities

**1. Use `npm ci` Instead of `npm install`**

- **Savings**: ~10-15s per run
- **Implementation**: Replace `npm install` with `npm ci` in workflow
- **Risk**: Low (standard best practice)

**2. Parallelize Jobs**

- **Savings**: ~20-30s (quality checks + tests run simultaneously)
- **Implementation**: Split single job into multiple jobs
- **Risk**: Medium (more complex workflow, more runner minutes)

**3. Cache Prisma Client Generation**

- **Savings**: ~5s per run
- **Implementation**: Cache `node_modules/.prisma` or custom output
- **Risk**: Low (must invalidate when schema changes)

**4. Skip E2E on Node 22.x**

- **Savings**: ~10s per run (already implemented ✅)
- **Current**: `if: matrix.node-version == '20.x'`
- **Rationale**: E2E tests don't vary by Node version

**5. Use Turborepo or Nx for Monorepo Caching**

- **Savings**: Significant for large codebases (50%+ potential)
- **Implementation**: Major refactor, add turbo/nx
- **Risk**: High (architectural change)

---

## Troubleshooting

### Debugging Failed CI Runs

**Step 1: Check Logs**

- Click on failed job in GitHub Actions UI
- Expand failed step to see error output
- Look for specific error messages

**Step 2: Reproduce Locally**

```bash
# Run full CI validation locally
npm run verify:all

# Run specific failing step
npm run typecheck
npm run lint
npm test
npm run test:e2e
```

**Step 3: Check Environment Differences**

```bash
# CI uses clean environment
# Try in fresh directory
git clone <repo> /tmp/test-ci
cd /tmp/test-ci
npm install
npm test
```

### Common "Works Locally, Fails in CI" Issues

**Issue**: Tests pass locally but fail in CI

**Causes**:

1. **Environment Variables** - CI doesn't have `.env` files
2. **File Paths** - CI uses Linux paths (`/`), Windows uses `\`
3. **Dependencies** - Different Node/npm versions
4. **Timing** - CI may be slower, causing timeouts
5. **State** - Local tests may depend on existing database/files

**Solutions**:

- Use absolute paths or `path.join()`
- Set all required env vars in workflow or provide defaults
- Match Node.js versions between local and CI
- Increase test timeouts for CI (`jest --testTimeout=10000`)
- Ensure tests clean up after themselves

### CI Performance Issues

**Symptom**: CI runs are slow (>5 minutes)

**Diagnosis**:

```bash
# Check which step is slowest in GitHub Actions logs
# Look for patterns:
# - "npm install" slow → cache not working
# - "npm test" slow → too many tests or slow tests
# - "typecheck" slow → too many files or complex types
```

**Solutions**:

- Verify npm cache is enabled (`cache: npm`)
- Profile tests locally: `npm test -- --verbose`
- Consider skipping some tests in CI with `it.skip()` for very slow tests
- Use `--maxWorkers` to limit parallelism

---

## Future Improvements

### Identified Opportunities

**1. Switch to `npm ci`**

- **Priority**: High
- **Effort**: Low (5 minutes)
- **Impact**: Faster, more reliable installs

**2. Upload Coverage Artifacts**

- **Priority**: Medium
- **Effort**: Low (10 minutes)
- **Impact**: Better visibility into coverage trends

**3. Parallelize Jobs**

- **Priority**: Medium
- **Effort**: Medium (1-2 hours)
- **Impact**: Faster feedback, but more complex

**4. Add CI Status Badge to README**

- **Priority**: Low
- **Effort**: Low (2 minutes)
- **Impact**: Visual indication of build status

**5. Pre-Commit Local CI Simulation**

- **Priority**: High
- **Effort**: Medium (30 minutes)
- **Impact**: Catch issues before pushing

**6. CI Performance Monitoring**

- **Priority**: Low
- **Effort**: Medium (1 hour)
- **Impact**: Track CI performance over time

### Proposed Work Item

See: `work-items/ci-improvements/` for detailed improvement plan

**Includes**:

- Switch to `npm ci`
- Upload coverage artifacts
- Add performance benchmarking
- Document CI debugging workflow
- Create troubleshooting playbook

---

## References

### Official Documentation

- **GitHub Actions**: https://docs.github.com/en/actions
- **Building Node.js**: https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs
- **Prisma Generate**: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client
- **Jest Configuration**: https://jestjs.io/docs/configuration
- **Playwright CI**: https://playwright.dev/docs/ci

### Related Knowledge Base Articles

- **[Jest Testing](../jest/README.md)** - Testing framework, patterns, coverage
- **[Prisma](../prisma/database-structure.md)** - ORM usage, schema, migrations
- **[SQLite](../sqlite/database-tools.md)** - Database access, CI considerations
- **[TypeScript](../typescript/README.md)** - TypeScript strict mode, path aliases
- **[Husky](../husky/README.md)** - Git hooks, pre-commit validation

### Related Instruction Files

- **[CI Instructions](.github/instructions/ci.instructions.md)** - Agent-facing CI guidance (NEW)
- **[Testing Instructions](.github/instructions/testing.instructions.md)** - Test writing patterns
- **[TDD Instructions](.github/instructions/tdd.instructions.md)** - Test-driven development

---

## Summary

**Key Takeaways**:

1. ✅ **Prisma postinstall hook** - Essential for CI, generates types automatically
2. ✅ **Jest global setup** - Apply database schema BEFORE tests import PrismaClient
3. ✅ **maxWorkers: 1** - Required for SQLite file-based databases
4. ✅ **DATABASE_URL fallback** - CI doesn't set by default, provide fallback
5. ✅ **Database files gitignored** - Never commit `.db` files, CI creates from schema
6. ✅ **Matrix testing** - Node 20.x + 22.x ensures broad compatibility
7. ✅ **npm cache** - Enabled via `cache: npm` in setup-node action
8. ⚠️ **Use `npm ci`** - Improvement opportunity for faster, more reliable builds

**Next Steps**:

1. Review `.github/instructions/ci.instructions.md` for agent-facing guidance
2. Consider implementing improvements from `work-items/ci-improvements/`
3. Add CI badge to README for build status visibility
4. Document team-specific CI patterns as they emerge
