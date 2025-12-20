import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wqfbltrnlwngyohvxjjq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxZmJsdHJubHduZ3lvaHZ4ampxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjIzODI4MCwiZXhwIjoyMDgxODE0MjgwfQ.ZCaKOuu0Q2OEKrzT88Q0OXiL8gSfx7NBdlsvEwnBftw';

async function executeSQL(sql) {
  // Use Supabase Management API to execute SQL
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: sql })
  });
  
  return response;
}

async function runMigration() {
  try {
    console.log('📖 Reading migration file...');
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250101000000_initial_schema.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('\n📋 Migration SQL to execute:');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    
    console.log('\n⚠️  Direct SQL execution via API is limited.');
    console.log('📝 Please execute this SQL in the Supabase Dashboard:');
    console.log(`\n🔗 https://supabase.com/dashboard/project/wqfbltrnlwngyohvxjjq/sql/new\n`);
    
    console.log('📋 Copy the SQL from: supabase/migrations/20250101000000_initial_schema.sql');
    console.log('   And paste it into the SQL Editor in your Supabase dashboard.\n');
    
    // Try to use psql via Supabase connection string if available
    console.log('💡 Alternative: Use Supabase CLI after logging in:');
    console.log('   1. Run: npx supabase login');
    console.log('   2. Run: npx supabase link --project-ref wqfbltrnlwngyohvxjjq');
    console.log('   3. Run: npx supabase db push\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runMigration();

