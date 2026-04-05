
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const postgres = require('postgres');

const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const PROJECT_REF = 'bvxqtzqkauonfyxobpih';
const connectionString = `postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

async function testConnection() {
  console.log('Testing connection to Supabase...');
  try {
    const sql = postgres(connectionString);
    const result = await sql`SELECT version();`;
    console.log('Successfully connected to Postgres!');
    console.log('Database Version:', result[0].version);
    await sql.end();
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
}

testConnection();
