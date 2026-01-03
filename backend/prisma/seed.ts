import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

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
  console.log('🌱 [SEED] Checking database...');

  // Check if data already exists (idempotent seeding)
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    console.log('✅ [SEED] Seed data already exists, skipping...');
    console.log(`   Found ${userCount} existing users`);
    return;
  }

  console.log('🌱 [SEED] Seeding database with test data...');
  console.log('');

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });
  console.log(`✅ Created user: ${testUser.name} (${testUser.email})`);

  // Create a sample thought
  const thought = await prisma.thought.create({
    data: {
      text: 'This is a sample thought for testing',
      source: 'manual',
      userId: testUser.id,
    },
  });
  console.log(`✅ Created thought: "${thought.text.substring(0, 40)}..."`);

  // Create a sample project
  const project = await prisma.project.create({
    data: {
      title: 'Sample Project',
      description: 'This is a sample project for testing',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Created project: ${project.title}`);

  // Create a sample action
  const action = await prisma.action.create({
    data: {
      title: 'Sample Action',
      description: 'This is a sample action for testing',
      actionType: 'Manual',
      status: 'TODO',
      projectId: project.id,
    },
  });
  console.log(`✅ Created action: ${action.title}`);

  // Link thought to project
  await prisma.projectThought.create({
    data: {
      projectId: project.id,
      thoughtId: thought.id,
    },
  });
  console.log('✅ Linked thought to project');

  console.log('');
  console.log('✅ [SEED] Database seeding complete!');
  console.log(`   Total: 1 user, 1 thought, 1 project, 1 action`);
}

main()
  .catch((e) => {
    console.error('❌ [SEED] Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
