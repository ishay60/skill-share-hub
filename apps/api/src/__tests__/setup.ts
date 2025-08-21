/// <reference types="jest" />
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables
config({ path: join(__dirname, '../../test.env') });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/skillsharehub',
    },
  },
});

beforeAll(async () => {
  try {
    // Clean up test database
    await prisma.post.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.space.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.warn('Database cleanup failed, continuing with tests:', error);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  try {
    // Clean up after each test
    await prisma.post.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.space.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.warn('Test cleanup failed:', error);
  }
});
