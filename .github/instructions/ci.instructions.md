# CI/CD Instructions

**Apply to**: GitHub Actions workflows, CI debugging, deployment processes  
**Reference**: [knowledge-base/github-actions/README.md](../../knowledge-base/github-actions/README.md) (700+ line comprehensive guide)

---

## Core Principles

When working with CI/CD in this project:

1. **Test locally first** - Run `npm run verify:all` before pushing
2. **Check knowledge base when CI fails** - Common issues documented with solutions
3. **Understand environment differences** - CI is fresh Ubuntu runner with no .env files
4. **SQLite needs serialization** - File-based databases require special handling

---

## Quick Workflow

### Pre-Push Validation

```bash
npm run verify:all  # Matches CI checks exactly
```

**What it runs**: typecheck → lint → format:check → test (frontend + backend) → e2e

### When CI Fails

1. **Reproduce locally**: Run `npm run verify:all`
2. **Check knowledge base**: [Common CI Issues](../../knowledge-base/github-actions/README.md#common-ci-issues--solutions)
3. **Compare environments**: Local has .env files, CI doesn't
4. **Check GitHub Actions logs**: Click "Details" on failed check

---

## Common Issue Patterns

**When you see TypeScript errors in CI**:
→ Check [Issue 1: Prisma Client Types](../../knowledge-base/github-actions/README.md#issue-1-prisma-client-types-not-generated)

**When you see "no such table" errors**:
→ Check [Issue 2: Database Schema Timing](../../knowledge-base/github-actions/README.md#issue-2-database-schema-not-applied-timing-issue)

**When tests timeout or lock**:
→ Check [Issue 3: SQLite Locking](../../knowledge-base/github-actions/README.md#issue-3-sqlite-database-locking)

**When you see DATABASE_URL errors**:
→ Check [Issue 4: Environment Variables](../../knowledge-base/github-actions/README.md#issue-4-database_url-not-set-in-ci)

**For all issues**: Full solutions with code examples in knowledge base

---

## CI Workflow Structure

Our CI pipeline has 3 phases running on **Node 20.x (LTS) and 22.x (Current)**:

1. **Setup** (30s) - Checkout, Node.js setup, dependencies
2. **Quality** (45s) - Typecheck, lint, format check
3. **Testing** (90s) - Frontend, backend, E2E tests

**Total Time**: 1-3 minutes  
**Why 2 checks?**: Matrix tests both Node.js LTS and Current versions

**For details**: See [CI Workflow Breakdown](../../knowledge-base/github-actions/README.md#current-ci-workflow)

---

## Environment: Local vs CI

| Aspect           | Local      | CI             |
| ---------------- | ---------- | -------------- |
| **DATABASE_URL** | .env file  | Needs fallback |
| **Dependencies** | Cached     | Fresh install  |
| **SQLite**       | Persistent | Fresh file     |

**Key Insight**: CI is fresh every time - environment variables need fallbacks

---

## Prisma in CI

**3 Critical Requirements**:

1. Generate client after install → `postinstall` hook
2. Apply schema before tests → Jest `globalSetup`
3. Set DATABASE_URL fallback → `jest.setup.ts`

**For implementation**: See [Prisma-Specific CI](../../knowledge-base/github-actions/README.md#prisma-specific-ci-patterns)

---

## Agent Workflow

### Creating Features

- Run `npm run verify:all` before push
- Database features need timing checks
- New env vars need CI fallbacks

### Debugging CI

1. Reproduce: `npm run verify:all`
2. Check knowledge base common issues
3. Review GitHub Actions logs

### Optimizing

- Consult [Performance Optimization](../../knowledge-base/github-actions/README.md#performance-optimization)
- 6 opportunities documented with effort/impact

---

## Quick Reference

**Commands**:

```bash
npm run verify:all  # Full validation
```

**Key Files**:

- `.github/workflows/ci.yml` - Workflow
- `backend/jest.setup.ts` - DB init
- `backend/jest.config.js` - Config

**Need Help?** → [knowledge-base/github-actions/README.md](../../knowledge-base/github-actions/README.md) (700+ lines)

---

**Deep Dive**: Knowledge base includes:

- Complete setup guides
- All code examples
- Troubleshooting workflows
- Performance strategies
- Official doc links
