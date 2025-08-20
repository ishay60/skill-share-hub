#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 SkillShareHub Demo Setup');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check if we're in the right directory
const scriptPath = path.resolve(__dirname, 'src/scripts/demo-seed.ts');

console.log('📋 Setting up your demo platform...\n');

// Run the TypeScript seed script with demo mode enabled
exec(
  'npx tsx src/scripts/demo-seed.ts',
  {
    cwd: __dirname,
    env: { ...process.env, DEMO_MODE: 'true' },
  },
  (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error running demo setup:', error);
      console.error('\n🔧 Troubleshooting:');
      console.error("- Make sure you're in the apps/api directory");
      console.error(
        '- Ensure the database is running (docker-compose up postgres)'
      );
      console.error(
        '- Check that Prisma schema is up to date (npx prisma db push)'
      );
      process.exit(1);
    }

    if (stderr) {
      console.error('⚠️  Warnings:', stderr);
    }

    console.log(stdout);

    console.log('\n🎯 Next Steps:');
    console.log('1. Start the API server: npm run dev');
    console.log('2. Start the web app: cd ../web && npm run dev');
    console.log('3. Visit: http://localhost:3001');
    console.log('4. Login with: demo@skillsharehub.com / demo123');
    console.log('\n🌟 Your demo platform is ready to impress!');
  }
);
