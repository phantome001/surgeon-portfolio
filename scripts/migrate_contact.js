
const { Client } = require('pg');

async function migrate() {
  const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || '3c7p4u8lgNSyNY0P';
  const PROJECT_REF = 'bvxqtzqkauonfyxobpih';
  const REGION = 'eu-west-1';
  const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?sslmode=require`;
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const sql = `
    CREATE TABLE IF NOT EXISTS contact_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'pending', 
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
    CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at);
  `;

  try {
    await client.connect();
    console.log('Connected to Postgres.');
    await client.query(sql);
    console.log('Migration successful: contact_requests table created.');
    await client.end();
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
