---
name: Prisma workflow guidelines
applyTo: 'backend/prisma/**'
---

## Prisma Migration Workflow

### Development (SQLite)

- Update `backend/prisma/schema.prisma` first.
- Create a migration with a clear name:
  - `powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/database/db-migrate.ps1 -Name add_user_phone`
  - Alternative: `npm run db:migrate --prefix backend -- --Name add_user_phone`
- Re-run `npx prisma generate` if client types are out of date (the migrate script does this implicitly).
- Commit the full migration folder under `backend/prisma/migrations/`.

### Production/Staging

- Apply pending migrations only:
  - `npm run db:migrate:prod --prefix backend`
- Never run `db:reset` outside of dev.

## Drift Handling (Lessons Learned)

Drift happens if schema changes are applied without a migration (manual DB edits or `db push`).

### If dev data can be discarded

- `npm run db:reset --prefix backend`
- Re-run migrations: `npm run db:migrate --prefix backend`

### If you need to preserve data or DB already has the change

1. Create a migration that matches the current DB state (manual SQL if needed).
2. Mark it as applied:
   - `npx prisma migrate resolve --applied <migration_name>`
3. Verify:
   - `npx prisma migrate status`
4. Keep future changes migration-only.

Tip: use `npx prisma migrate diff` when you need to understand differences without resetting.

## Schema Change Checklist

When adding a new column (e.g., `phone`), update:

- `backend/prisma/schema.prisma`
- Prisma migration SQL
- Domain types (`backend/src/domain/types/*.ts`)
- Domain model (`backend/src/domain/models/*.ts`)
- Mappers (`backend/src/infrastructure/prisma/mappers/*.ts`)
- Repositories (`backend/src/infrastructure/prisma/repositories/*.ts`)
- Seed data (`backend/prisma/seed.ts`)
- Tests/fixtures that build user records

## E2E Seeding Stability

If Playwright depends on fixed admin credentials, seed consistently by setting:

- `SEED_ADMIN_USER_FORCE=true` (updates existing admin to match env)
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`

## References

- https://www.prisma.io/docs/orm/prisma-migrate
- https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production
