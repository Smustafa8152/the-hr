import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get credentials from environment or use defaults
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wqfbltrnlwngyohvxjjq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxZmJsdHJubHduZ3lvaHZ4ampxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjIzODI4MCwiZXhwIjoyMDgxODE0MjgwfQ.ZCaKOuu0Q2OEKrzT88Q0OXiL8gSfx7NBdlsvEwnBftw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('📖 Reading migration file...');
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250101000000_initial_schema.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // Try direct query execution
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            },
            body: JSON.stringify({ sql_query: statement })
          });
          
          if (!response.ok) {
            // If RPC doesn't exist, try using the SQL editor API
            console.log('⚠️  RPC method not available, trying direct SQL execution...');
            // For now, we'll use a workaround - execute via PostgREST or show instructions
            console.log('ℹ️  Some statements may need to be run manually in Supabase dashboard.');
            console.log('📋 SQL Statement:', statement.substring(0, 100) + '...');
            continue;
          }
        } else {
          console.log('✅ Statement executed successfully');
        }
      } catch (err) {
        console.log('⚠️  Error executing statement:', err.message);
        console.log('📋 SQL:', statement.substring(0, 150));
      }
    }
    
    console.log('\n✅ Migration process completed!');
    console.log('\n📝 Note: Some statements may need to be executed manually in the Supabase SQL Editor.');
    console.log('   Go to: https://supabase.com/dashboard/project/wqfbltrnlwngyohvxjjq/sql/new');
    console.log('   And paste the contents of: supabase/migrations/20250101000000_initial_schema.sql');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

runMigration();

