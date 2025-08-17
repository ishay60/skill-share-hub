import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Clean up existing data
  await prisma.post.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.space.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('🧹 Cleaned up existing data');
  
  // Create test users
  const creator = await prisma.user.create({
    data: {
      email: 'creator@example.com',
      password_hash: await hashPassword('password123'),
      role: 'creator',
    },
  });
  
  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@example.com',
      password_hash: await hashPassword('password123'),
      role: 'user',
    },
  });
  
  console.log('👥 Created test users');
  
  // Create test space
  const space = await prisma.space.create({
    data: {
      name: 'JavaScript Mastery',
      description: 'Learn advanced JavaScript concepts and best practices',
      slug: 'javascript-mastery',
      ownerId: creator.id,
    },
  });
  
  console.log('🚀 Created test space');
  
  // Create test posts
  const publicPost = await prisma.post.create({
    data: {
      title: 'Getting Started with JavaScript',
      content_md: '# Getting Started with JavaScript\n\nJavaScript is a powerful programming language...',
      is_premium: false,
      published_at: new Date(),
      spaceId: space.id,
      authorId: creator.id,
    },
  });
  
  const premiumPost = await prisma.post.create({
    data: {
      title: 'Advanced JavaScript Patterns',
      content_md: '# Advanced JavaScript Patterns\n\nThis is premium content for subscribers...',
      is_premium: true,
      published_at: new Date(),
      spaceId: space.id,
      authorId: creator.id,
    },
  });
  
  console.log('📝 Created test posts');
  
  // Create test membership
  const membership = await prisma.membership.create({
    data: {
      userId: viewer.id,
      spaceId: space.id,
      status: 'free',
    },
  });
  
  console.log('🔗 Created test membership');
  
  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Test Data Summary:');
  console.log(`👤 Creator: ${creator.email} (password: password123)`);
  console.log(`👤 Viewer: ${viewer.email} (password: password123)`);
  console.log(`🚀 Space: ${space.name} (slug: ${space.slug})`);
  console.log(`📝 Posts: ${publicPost.title} (public), ${premiumPost.title} (premium)`);
  console.log(`🔗 Membership: ${viewer.email} -> ${space.name} (free)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
