/// <reference types="node" />
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcrypt';

// Initialize Prisma Client with adapter (required for Prisma 7.x + SQLite)
let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
dbUrl = dbUrl.split('?')[0]; // Remove query parameters for adapter

const adapter = new PrismaLibSql({
  url: dbUrl,
});

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function main() {
  console.log('dYO� [SEED] Checking database...');

  const shouldSeedAdmin = process.env.SEED_ADMIN_USER !== 'false';
  const forceSeedAdmin = process.env.SEED_ADMIN_USER_FORCE === 'true';
  if (!shouldSeedAdmin) {
    console.log('�o. [SEED] Admin seeding disabled (SEED_ADMIN_USER=false).');
    return;
  }

  const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'AdminPass1!';
  const adminName = process.env.ADMIN_NAME || 'Administrator';
  const adminEmail = process.env.ADMIN_EMAIL ?? null;

  if (!adminUsername || !adminPassword) {
    console.log('�o. [SEED] ADMIN_USERNAME or ADMIN_PASSWORD missing, skipping admin seed.');
    return;
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { username: adminUsername },
  });

  if (existingAdmin && !forceSeedAdmin) {
    console.log('�o. [SEED] Admin user already exists, skipping...');
    return;
  }

  console.log('dYO� [SEED] Seeding admin user...');
  console.log('');

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

  const adminUser = existingAdmin
    ? await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          username: adminUsername,
          email: adminEmail,
          name: adminName,
          passwordHash,
          role: 'ADMIN',
          status: 'ACTIVE',
          failedLoginCount: 0,
          lockoutUntil: null,
          lastLoginAt: null,
        },
      })
    : await prisma.user.create({
        data: {
          username: adminUsername,
          email: adminEmail,
          name: adminName,
          passwordHash,
          role: 'ADMIN',
          status: 'ACTIVE',
          failedLoginCount: 0,
          lockoutUntil: null,
          lastLoginAt: null,
        },
      });

  console.log(`�o. Created admin user: ${adminUser.username}`);
  console.log('');
  console.log('�o. [SEED] Admin seeding complete!');
}

main()
  .catch((e) => {
    console.error('�?O [SEED] Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
