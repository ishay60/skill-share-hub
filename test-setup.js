#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing SkillShareHub Phase 0 Setup...\n');

// Test 1: Check if all required files exist
const requiredFiles = [
  'package.json',

  'tsconfig.json',
  '.eslintrc.json',
  '.prettierrc',
  'docker-compose.yml',
  'env.example',
  'README.md',
  '.cursor/rules.md',
  'apps/web/package.json',
  'apps/web/vite.config.ts',
  'apps/web/tailwind.config.js',
  'apps/web/src/main.tsx',
  'apps/web/src/App.tsx',
  'apps/web/src/pages/LandingPage.tsx',
  'apps/api/package.json',
  'apps/api/src/index.ts',
  'packages/ui/package.json',
  'packages/types/package.json',
  '.github/workflows/ci.yml',
];

console.log('📁 Checking required files...');
let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Test 2: Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
try {
  const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = [
    'dev',
    'dev:web',
    'dev:api',
    'docker:up',
    'docker:down',
    'setup',
  ];

  requiredScripts.forEach(script => {
    if (rootPackage.scripts[script]) {
      console.log(`  ✅ ${script}`);
    } else {
      console.log(`  ❌ ${script} - MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('  ❌ Error reading package.json');
  allFilesExist = false;
}

// Test 3: Check Docker Compose services
console.log('\n🐳 Checking Docker Compose services...');
try {
  const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
  const requiredServices = ['postgres', 'redis', 'mailhog', 'api', 'web'];

  requiredServices.forEach(service => {
    if (dockerCompose.includes(service + ':')) {
      console.log(`  ✅ ${service}`);
    } else {
      console.log(`  ❌ ${service} - MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('  ❌ Error reading docker-compose.yml');
  allFilesExist = false;
}

// Test 4: Check CI workflow
console.log('\n🚀 Checking GitHub Actions CI...');
try {
  const ciWorkflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
  const requiredJobs = ['lint-and-typecheck', 'test', 'build', 'security'];

  requiredJobs.forEach(job => {
    if (ciWorkflow.includes(job + ':')) {
      console.log(`  ✅ ${job}`);
    } else {
      console.log(`  ❌ ${job} - MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('  ❌ Error reading CI workflow');
  allFilesExist = false;
}

// Test 5: Check TypeScript configurations
console.log('\n📝 Checking TypeScript configurations...');
const tsConfigs = [
  'tsconfig.json',
  'apps/web/tsconfig.json',
  'apps/api/tsconfig.json',
  'packages/ui/tsconfig.json',
  'packages/types/tsconfig.json',
];

tsConfigs.forEach(config => {
  if (fs.existsSync(config)) {
    console.log(`  ✅ ${config}`);
  } else {
    console.log(`  ❌ ${config} - MISSING`);
    allFilesExist = false;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 Phase 0 Setup Complete! All tests passed.');
  console.log('\n🚀 Next steps:');
  console.log('  1. Run: npm install');
  console.log('  2. Run: npm run docker:up');
  console.log('  3. Visit: http://localhost:3000 (web)');
  console.log('  4. Visit: http://localhost:4000/health (api)');
  console.log('\n📋 Ready to start Phase 1: MVP Core');
} else {
  console.log('❌ Some tests failed. Please check the missing files above.');
}
console.log('='.repeat(50));
