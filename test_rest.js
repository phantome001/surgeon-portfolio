const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRest() {
  console.log('Testing Supabase REST API...');
  try {
    const { data, error } = await supabase
      .from('_test_connection_') // This table likely doesn't exist
      .select('*')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
        // Table not found is good! It means we hit the DB.
        console.log('Successfully connected to Supabase REST API!');
    } else if (error) {
        console.log('REST API Response (Error):', error.message);
    } else {
        console.log('REST API Response (Success): Success!');
    }
  } catch (err) {
    console.error('REST API Failure:', err.message);
  }
}

testRest();
