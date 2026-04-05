
const { Client } = require('pg');

async function testConnection() {
  // Use process.env directly, expected to be populated via --env-file
  const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
  const PROJECT_REF = 'bvxqtzqkauonfyxobpih';
  const connectionString = `postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres?sslmode=require`;
  
  const client = new Client({
    connectionString: connectionString,
  });

  console.log('Testing connection with node-postgres (pg)...');
  try {
    await client.connect();
    console.log('Successfully connected to Postgres!');
    const res = await client.query('SELECT version();');
    console.log('Database Version:', res.rows[0].version);
    await client.end();
  } catch (err) {
    console.error('Failed to connect with node-postgres:', err.message);
    // Log helpful details for troubleshooting
    if (err.message.includes('password authentication failed')) {
      console.log('TIP: The password provided might be incorrect.');
    } else if (err.message.includes('ENOTFOUND')) {
      console.log('TIP: Check the hostname or your internet connection.');
    }
    process.exit(1);
  }
}

testConnection();
