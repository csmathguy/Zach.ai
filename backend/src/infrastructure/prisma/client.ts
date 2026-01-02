import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 *
 * Ensures only one instance of Prisma Client exists throughout the application lifecycle.
 * Reuses the existing instance if available, creates a new one otherwise.
 *
 * In development, we attach to globalThis to prevent hot-reloading from creating multiple instances.
 */

// Extend globalThis to include our Prisma instance
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Get or create the singleton Prisma Client instance
 *
 * Note: Prisma 7.x reads database URL from prisma.config.ts automatically
 */
export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

// In development, store in globalThis to survive hot-reloads
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Graceful shutdown handler
 * Call this when your application terminates to properly disconnect from the database
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

// Handle process termination signals
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    await disconnectPrisma();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}
