const { Client } = require('pg');

async function testConnection() {
  console.log('🔍 Testing database connection...');

  const connectionStrings = [
    'postgresql://postgres:postgres@localhost:5432/skillsharehub',
    'postgresql://postgres@localhost:5432/skillsharehub',
    'postgresql://skillsharehub_app:app_password123@localhost:5432/skillsharehub',
  ];

  for (let i = 0; i < connectionStrings.length; i++) {
    const connectionString = connectionStrings[i];
    console.log(`\n📡 Testing: ${connectionString}`);

    const client = new Client({ connectionString });

    try {
      await client.connect();
      console.log('✅ Connection successful!');

      const result = await client.query('SELECT 1 as test');
      console.log('✅ Query successful:', result.rows[0]);

      await client.end();
      console.log('✅ Connection closed successfully');
      return true;
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      if (error.code) {
        console.log('   Error code:', error.code);
      }
    }
  }

  console.log('\n❌ All connection attempts failed');
  return false;
}

testConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Database connection working!');
    } else {
      console.log('\n💡 Database connection needs to be fixed');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
