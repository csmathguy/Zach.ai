/**
 * Jest Global Setup
 *
 * Runs once before all test suites to initialize the test environment.
 * Applies Prisma schema to the test database.
 */

import { execSync } from 'child_process';

/**
 * Apply database schema before running tests
 *
 * In CI, DATABASE_URL may not be set or may point to an empty SQLite file.
 * We need to apply the Prisma schema before tests can run.
 *
 * Uses `prisma db push --accept-data-loss` because:
 * - Prisma Client already generated via postinstall hook
 * - Need schema applied to actual database file tests will use
 * - Non-interactive (safe for CI)
 */
export default async function globalSetup() {
  console.log('🔧 Applying database schema for tests...');

  // Ensure DATABASE_URL is set (default to dev.db if not specified)
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./dev.db?journal_mode=WAL';
    console.log('📌 DATABASE_URL not set, using default: file:./dev.db');
  }

  try {
    // Apply schema to test database (respects DATABASE_URL env var)
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: __dirname,
      env: process.env, // Pass environment variables including DATABASE_URL
    });

    console.log('✅ Database schema applied successfully');
  } catch (error) {
    console.error('❌ Failed to apply database schema:', error);
    throw error;
  }
}
