import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  // Clean up existing data
  await prisma.subscription.deleteMany();
  await prisma.plan.deleteMany();
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

  // Create default plans for the space
  const monthlyPlan = await prisma.plan.create({
    data: {
      spaceId: space.id,
      name: 'Monthly',
      interval: 'month',
      price_cents: 999, // $9.99
    },
  });

  const yearlyPlan = await prisma.plan.create({
    data: {
      spaceId: space.id,
      name: 'Yearly',
      interval: 'year',
      price_cents: 9999, // $99.99 (2 months free)
    },
  });

  console.log('💰 Created subscription plans');

  // Create test posts
  const publicPost = await prisma.post.create({
    data: {
      title: 'Getting Started with JavaScript',
      content_html:
        '<h1>Getting Started with JavaScript</h1><p>JavaScript is a powerful programming language...</p>',
      is_premium: false,
      published_at: new Date(),
      spaceId: space.id,
      authorId: creator.id,
    },
  });

  const premiumPost = await prisma.post.create({
    data: {
      title: 'Advanced JavaScript Patterns',
      content_html:
        '<h1>Advanced JavaScript Patterns</h1><p>This is premium content for subscribers...</p>',
      is_premium: true,
      published_at: new Date(),
      spaceId: space.id,
      authorId: creator.id,
    },
  });

  console.log('📝 Created test posts');

  // Create test membership
  await prisma.membership.create({
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
  console.log(
    `💰 Plans: ${monthlyPlan.name} ($${(monthlyPlan.price_cents / 100).toFixed(2)}/${monthlyPlan.interval}), ${yearlyPlan.name} ($${(yearlyPlan.price_cents / 100).toFixed(2)}/${yearlyPlan.interval})`
  );
  console.log(
    `📝 Posts: ${publicPost.title} (public), ${premiumPost.title} (premium)`
  );
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
