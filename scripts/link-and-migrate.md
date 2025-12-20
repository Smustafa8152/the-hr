# Link Project and Create Tables - Manual Steps

Since the Supabase CLI requires interactive login, follow these steps:

## Option 1: Using Supabase CLI (Recommended)

### Step 1: Get Access Token
1. Go to: https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Copy the token

### Step 2: Link Project
```bash
# Set the access token
$env:SUPABASE_ACCESS_TOKEN="your_access_token_here"

# Link the project
npx supabase link --project-ref wqfbltrnlwngyohvxjjq
```

### Step 3: Push Migrations
```bash
npx supabase db push
```

## Option 2: Manual SQL Execution (Quick)

1. Go to: https://supabase.com/dashboard/project/wqfbltrnlwngyohvxjjq/sql/new
2. Copy the entire contents of: `supabase/migrations/20250101000000_initial_schema.sql`
3. Paste into the SQL Editor
4. Click "Run"

This will create all your tables immediately!

