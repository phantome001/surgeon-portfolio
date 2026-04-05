
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// We use the region eu-west-1 pooler for better DNS resolution on some networks
const PROJECT_REF = 'bvxqtzqkauonfyxobpih';
const REGION = 'eu-west-1';
const PASSWORD = process.env.SUPABASE_DB_PASSWORD;

/* 
Supabase direct connection vs pooler:
- db.[project-ref].supabase.co (Direct, 5432)
- aws-0-[region].pooler.supabase.com (Pooler, 6543/5432)
*/

const connectionString = `postgresql://${PROJECT_REF}:${encodeURIComponent(PASSWORD)}@aws-1-${REGION}.pooler.supabase.com:6543/postgres?sslmode=require`;
async function executeSQL(sqlString) {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase (eu-west-1 pooler).');
    const res = await client.query(sqlString);
    console.log('Success (Query Result):');
    if (Array.isArray(res)) {
      res.forEach((r, i) => console.log(`Result ${i}:`, r.command, r.rowCount));
    } else {
      console.log(res.command, res.rowCount);
      if (res.rows.length > 0) console.table(res.rows);
    }
    await client.end();
  } catch (err) {
    console.error('Error executing SQL:', err.message);
    process.exit(1);
  }
}

// Support command-line execution: node db_manager.js "SELECT 1"
if (process.argv[2]) {
  executeSQL(process.argv[2]);
}

module.exports = { executeSQL };
