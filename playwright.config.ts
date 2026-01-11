import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: {
    command: 'npm run db:seed --prefix backend && npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      ADMIN_USERNAME: process.env.ADMIN_USERNAME ?? 'admin',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? 'AdminPass1!',
      ADMIN_NAME: process.env.ADMIN_NAME ?? 'Administrator',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? 'admin@local.test',
      SEED_ADMIN_USER: process.env.SEED_ADMIN_USER ?? 'true',
      SEED_ADMIN_USER_FORCE: process.env.SEED_ADMIN_USER_FORCE ?? 'true',
      BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ?? '12',
    },
  },
});
