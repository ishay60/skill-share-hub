import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Demo content templates
const DEMO_POSTS = [
  {
    title: '🚀 Welcome to SkillShareHub',
    content_html: `
      <div class="prose prose-lg max-w-none">
        <h2>🎉 Welcome to Your Knowledge Sharing Platform!</h2>
        
        <p>SkillShareHub is a powerful platform for creators to share knowledge, build communities, and monetize their expertise. This demo space showcases the platform's capabilities.</p>
        
        <h3>✨ Key Features</h3>
        <ul>
          <li><strong>Rich Content Creation</strong> - Create interactive posts with HTML, formatting, and media</li>
          <li><strong>Premium Subscriptions</strong> - Monetize your content with Stripe-powered billing</li>
          <li><strong>Real-time Q&A</strong> - Engage with your community through live discussions</li>
          <li><strong>Analytics Dashboard</strong> - Track performance and growth metrics</li>
          <li><strong>Custom Branding</strong> - Personalize your space with custom domains and styling</li>
        </ul>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; margin: 20px 0;">
          <h4 style="margin: 0; color: white;">💡 Interactive Demo Element</h4>
          <p style="margin: 10px 0 0 0;">This is an example of rich, interactive content that creators can embed in their posts!</p>
        </div>
        
        <p><em>This post demonstrates the rich text editor and HTML rendering capabilities.</em></p>
      </div>
    `,
    is_premium: false,
    published_at: new Date(),
  },
  {
    title: '💎 Premium Content: Advanced Strategies',
    content_html: `
      <div class="prose prose-lg max-w-none">
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
          <h4 style="margin: 0; color: #92400e;">🔒 Premium Content</h4>
          <p style="margin: 5px 0 0 0; color: #92400e;">This content is available to subscribers only.</p>
        </div>
        
        <h2>🎯 Advanced Growth Strategies</h2>
        
        <p>In this premium post, I'll share the exact strategies I used to grow my audience by 10x in 6 months.</p>
        
        <h3>📊 The Data-Driven Approach</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; color: #374151;">Content Strategy</h4>
            <ul style="margin: 0;">
              <li>Consistency over perfection</li>
              <li>Value-first approach</li>
              <li>Community engagement</li>
            </ul>
          </div>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; color: #374151;">Analytics Focus</h4>
            <ul style="margin: 0;">
              <li>Track engagement rates</li>
              <li>Monitor conversion funnels</li>
              <li>A/B test content types</li>
            </ul>
          </div>
        </div>
        
        <blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 20px 0; font-style: italic;">
          "Success in content creation isn't about viral posts—it's about building lasting relationships with your audience."
        </blockquote>
        
        <p>Continue reading to discover the specific tools and metrics I use...</p>
      </div>
    `,
    is_premium: true,
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    title: '🛠️ Interactive Tutorial: Building Your First Feature',
    content_html: `
      <div class="prose prose-lg max-w-none">
        <h2>🚀 Interactive Development Tutorial</h2>
        
        <p>Let's build something amazing together! This interactive tutorial shows how you can create engaging educational content.</p>
        
        <div style="background: #1f2937; color: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; font-family: 'Courier New', monospace;">
          <div style="color: #10b981; margin-bottom: 10px;">$ Getting Started</div>
          <div style="color: #60a5fa;">function createAwesomeFeature() {</div>
          <div style="margin-left: 20px; color: #fbbf24;">// Your code here</div>
          <div style="margin-left: 20px; color: #f87171;">console.log('Hello, SkillShareHub!');</div>
          <div style="color: #60a5fa;">}</div>
        </div>
        
        <h3>📝 Step-by-Step Instructions</h3>
        
        <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <strong style="color: #047857;">✅ Step 1:</strong> Set up your development environment
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <strong style="color: #92400e;">⚡ Step 2:</strong> Install the required dependencies
        </div>
        
        <div style="background: #e0f2fe; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <strong style="color: #0c4a6e;">🎯 Step 3:</strong> Build and test your feature
        </div>
        
        <h3>🎮 Interactive Demo</h3>
        
        <div style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); padding: 2px; border-radius: 10px; margin: 20px 0;">
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; text-align: center;">🎨 Live Preview Area</h4>
            <p style="text-align: center; margin: 0; color: #666;">This is where your interactive content would appear!</p>
          </div>
        </div>
        
        <p>This tutorial demonstrates how SkillShareHub enables creators to build rich, interactive learning experiences that go far beyond traditional blog posts.</p>
      </div>
    `,
    is_premium: false,
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    title: '📊 Platform Analytics Deep Dive',
    content_html: `
      <div class="prose prose-lg max-w-none">
        <h2>📈 Understanding Your Platform Analytics</h2>
        
        <p>Analytics are crucial for growing your knowledge-sharing platform. Let's explore the key metrics that matter.</p>
        
        <h3>🎯 Key Performance Indicators</h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #1e40af;">2,847</div>
            <div style="color: #3730a3; font-size: 14px;">Total Subscribers</div>
          </div>
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #166534;">$12,450</div>
            <div style="color: #14532d; font-size: 14px;">Monthly Revenue</div>
          </div>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #92400e;">94.2%</div>
            <div style="color: #78350f; font-size: 14px;">Retention Rate</div>
          </div>
          <div style="background: #fce7f3; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #be185d;">156</div>
            <div style="color: #9d174d; font-size: 14px;">New This Month</div>
          </div>
        </div>
        
        <h3>📊 Growth Trends</h3>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin: 0 0 15px 0;">Monthly Growth Chart</h4>
          <div style="height: 100px; background: linear-gradient(to right, #3b82f6 0%, #10b981 50%, #f59e0b 100%); border-radius: 4px; position: relative; display: flex; align-items: end; padding: 10px;">
            <div style="color: white; font-size: 12px; position: absolute; top: 10px; left: 10px;">Revenue Growth: +24% this quarter</div>
          </div>
        </div>
        
        <h3>💡 Actionable Insights</h3>
        
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
          <strong style="color: #0c4a6e;">💡 Pro Tip:</strong> Focus on engagement metrics rather than just subscriber count. A smaller, highly engaged community often generates more revenue and creates better learning outcomes.
        </div>
        
        <p>Use these analytics to continuously improve your content strategy and community building efforts.</p>
      </div>
    `,
    is_premium: true,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
];

const DEMO_QA_THREADS = [
  {
    title: 'How to get started with premium content?',
    messages: [
      {
        content:
          "I'm new to the platform and wondering what's the best way to create engaging premium content that subscribers will love?",
        is_answer: false,
      },
      {
        content:
          'Great question! I recommend starting with content that solves specific problems your audience faces. Focus on actionable insights and step-by-step tutorials. The key is providing immediate value that justifies the premium price point.',
        is_answer: true,
        accepted_at: new Date(),
      },
      {
        content: 'Thanks! Should I create a mix of free and premium content?',
        is_answer: false,
      },
      {
        content:
          'Absolutely! Use free content to showcase your expertise and attract new followers, then use premium content to dive deeper into advanced topics. A good ratio is about 70% free, 30% premium.',
        is_answer: false,
      },
    ],
  },
  {
    title: 'Best practices for community engagement?',
    messages: [
      {
        content:
          "How do you keep your community active and engaged? I'm struggling with getting people to participate in discussions.",
        is_answer: false,
      },
      {
        content:
          "Community engagement is all about consistency and genuine interaction. Here are my top strategies:\n\n1. Ask specific questions in your posts\n2. Respond to every comment within 24 hours\n3. Share behind-the-scenes content\n4. Host regular Q&A sessions\n5. Celebrate community member achievements\n\nThe key is to be genuinely interested in your community members' success!",
        is_answer: true,
        accepted_at: new Date(),
      },
    ],
  },
];

async function createDemoData() {
  console.log('🌱 Starting demo seed process...');

  try {
    // 1. Create demo users
    console.log('👥 Creating demo users...');

    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Creator user
    const creator = await prisma.user.upsert({
      where: { email: 'demo@skillsharehub.com' },
      update: {},
      create: {
        email: 'demo@skillsharehub.com',
        password_hash: hashedPassword,
        role: 'CREATOR',
      },
    });

    // Regular users
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'alice@example.com' },
        update: {},
        create: {
          email: 'alice@example.com',
          password_hash: hashedPassword,
          role: 'USER',
        },
      }),
      prisma.user.upsert({
        where: { email: 'bob@example.com' },
        update: {},
        create: {
          email: 'bob@example.com',
          password_hash: hashedPassword,
          role: 'USER',
        },
      }),
      prisma.user.upsert({
        where: { email: 'charlie@example.com' },
        update: {},
        create: {
          email: 'charlie@example.com',
          password_hash: hashedPassword,
          role: 'USER',
        },
      }),
    ]);

    console.log(`✅ Created ${users.length + 1} demo users`);

    // 2. Create demo space
    console.log('🏢 Creating demo space...');

    const space = await prisma.space.upsert({
      where: { slug: 'skillshare-demo' },
      update: {},
      create: {
        name: 'SkillShare Academy',
        description:
          'A comprehensive platform for learning modern web development, entrepreneurship, and digital marketing. Join our community of creators and learners!',
        slug: 'skillshare-demo',
        ownerId: creator.id,
        subdomain: 'academy',
        brand_color: '#4F46E5',
        accent_color: '#10B981',
        meta_title: 'SkillShare Academy - Learn. Build. Grow.',
        meta_description:
          'Master web development, entrepreneurship, and digital marketing with our expert-led courses and vibrant community.',
      },
    });

    console.log('✅ Created demo space');

    // 3. Create pricing plans
    console.log('💰 Creating pricing plans...');

    // Check if plans already exist
    const existingPlans = await prisma.plan.findMany({
      where: { spaceId: space.id },
    });

    let plans = existingPlans;

    if (existingPlans.length === 0) {
      plans = await Promise.all([
        prisma.plan.create({
          data: {
            spaceId: space.id,
            name: 'Monthly Pro',
            interval: 'MONTH',
            price_cents: 2900, // $29/month
          },
        }),
        prisma.plan.create({
          data: {
            spaceId: space.id,
            name: 'Annual Pro',
            interval: 'YEAR',
            price_cents: 29900, // $299/year (save $49)
          },
        }),
      ]);
    }

    console.log(`✅ Created ${plans.length} pricing plans`);

    // 4. Create demo posts
    console.log('📝 Creating demo posts...');

    // Check if posts already exist
    const existingPosts = await prisma.post.findMany({
      where: { spaceId: space.id },
    });

    let posts = existingPosts;

    if (existingPosts.length === 0) {
      posts = await Promise.all(
        DEMO_POSTS.map(postData =>
          prisma.post.create({
            data: {
              ...postData,
              spaceId: space.id,
              authorId: creator.id,
            },
          })
        )
      );
    }

    console.log(`✅ Created ${posts.length} demo posts`);

    // 5. Create demo subscriptions
    console.log('🎫 Creating demo subscriptions...');

    // Check if subscriptions already exist
    const existingSubscriptions = await prisma.subscription.findMany({
      where: {
        spaceId: space.id,
        userId: { in: [users[0].id, users[1].id] },
      },
    });

    let subscriptions = existingSubscriptions;

    if (existingSubscriptions.length === 0) {
      subscriptions = await Promise.all([
        prisma.subscription.create({
          data: {
            userId: users[0].id,
            spaceId: space.id,
            planId: plans[0].id,
            stripe_customer_id: 'cus_demo_alice',
            stripe_sub_id: 'sub_demo_alice',
            status: 'ACTIVE',
            current_period_start: new Date(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        }),
        prisma.subscription.create({
          data: {
            userId: users[1].id,
            spaceId: space.id,
            planId: plans[1].id,
            stripe_customer_id: 'cus_demo_bob',
            stripe_sub_id: 'sub_demo_bob',
            status: 'ACTIVE',
            current_period_start: new Date(),
            current_period_end: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000
            ), // 1 year
          },
        }),
      ]);
    }

    console.log(`✅ Created ${subscriptions.length} demo subscriptions`);

    // 6. Create Q&A threads and messages
    console.log('💬 Creating Q&A content...');

    // Check if Q&A threads already exist
    const existingThreads = await prisma.qAThread.findMany({
      where: { spaceId: space.id },
    });

    if (existingThreads.length === 0) {
      for (const threadData of DEMO_QA_THREADS) {
        const thread = await prisma.qAThread.create({
          data: {
            title: threadData.title,
            spaceId: space.id,
            createdBy: users[Math.floor(Math.random() * users.length)].id,
          },
        });

        for (const [index, messageData] of threadData.messages.entries()) {
          await prisma.qAMessage.create({
            data: {
              content: messageData.content,
              threadId: thread.id,
              userId:
                index === 0 || !messageData.is_answer
                  ? users[Math.floor(Math.random() * users.length)].id
                  : creator.id,
              is_answer: messageData.is_answer,
              is_accepted: !!messageData.accepted_at,
            },
          });
        }
      }
    }

    console.log(`✅ Created ${DEMO_QA_THREADS.length} Q&A threads`);

    // 7. Create demo analytics data
    console.log('📊 Creating analytics data...');

    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    });

    // Check if analytics data already exists
    const existingSnapshots = await prisma.metricSnapshot.findMany({
      where: { spaceId: space.id },
    });

    let analyticsData = existingSnapshots;

    if (existingSnapshots.length === 0) {
      analyticsData = await Promise.all(
        dates.map(date =>
          prisma.metricSnapshot.create({
            data: {
              spaceId: space.id,
              date: new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
              ),
              active_subs: Math.floor(Math.random() * 50) + 100,
              mrr_cents: Math.floor(Math.random() * 500000) + 1000000, // $10k-$15k MRR
              total_revenue_cents:
                Math.floor(Math.random() * 10000000) + 5000000,
              churn_rate: Math.random() * 0.1, // 0-10% churn
              new_subs: Math.floor(Math.random() * 10) + 5,
              canceled_subs: Math.floor(Math.random() * 5),
              post_views: Math.floor(Math.random() * 500) + 200,
              qa_messages: Math.floor(Math.random() * 20) + 10,
              unique_visitors: Math.floor(Math.random() * 200) + 100,
            },
          })
        )
      );
    }

    console.log(`✅ Created ${analyticsData.length} analytics snapshots`);

    // 8. Create demo event logs
    console.log('📈 Creating event logs...');

    // Check if event logs already exist
    const existingEventLogs = await prisma.eventLog.findMany({
      where: { spaceId: space.id },
      take: 10,
    });

    if (existingEventLogs.length === 0) {
      const eventTypes = [
        'space_visit',
        'post_view',
        'qa_message',
        'login',
        'signup',
      ];
      const eventLogs = [];

      for (let i = 0; i < 100; i++) {
        const randomDate = new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        );
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomEventType =
          eventTypes[Math.floor(Math.random() * eventTypes.length)];

        eventLogs.push(
          prisma.eventLog.create({
            data: {
              userId: randomUser.id,
              spaceId: space.id,
              type: randomEventType,
              metadata: {
                userAgent: 'Demo Browser',
                ip: '127.0.0.1',
                timestamp: randomDate.toISOString(),
              },
              created_at: randomDate,
            },
          })
        );
      }

      await Promise.all(eventLogs);
      console.log(`✅ Created ${eventLogs.length} event logs`);
    } else {
      console.log(
        `✅ Event logs already exist (${existingEventLogs.length}+ found)`
      );
    }

    console.log('\n🎉 Demo seed completed successfully!');
    console.log('\n📋 Demo Account Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👨‍💼 Creator Account: demo@skillsharehub.com`);
    console.log(`🔑 Password: demo123`);
    console.log(`🌐 Demo Space: http://localhost:3001/spaces/skillshare-demo`);
    console.log(`📊 Analytics: http://localhost:3001/analytics/${space.id}`);
    console.log(`🎨 Branding: http://localhost:3001/branding/${space.id}`);
    console.log(`📝 Posts: http://localhost:3001/posts/${space.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(
      `👥 Test Users: alice@example.com, bob@example.com, charlie@example.com`
    );
    console.log(`🔑 All passwords: demo123`);
    console.log('\n✨ Your demo platform is ready to showcase!');
  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed script
if (require.main === module) {
  createDemoData();
}

export default createDemoData;
