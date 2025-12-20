# Supabase Setup Guide

This guide will help you set up and connect your Supabase account with this project using the Supabase CLI.

## Prerequisites

1. **Install Supabase CLI** (if not already installed):
   ```bash
   # Using npm
   npm install -g supabase
   
   # Using pnpm
   pnpm add -g supabase
   
   # Or using Homebrew (macOS/Linux)
   brew install supabase/tap/supabase
   ```

2. **Verify installation**:
   ```bash
   supabase --version
   ```

## Step 1: Link Your Project

Link your local project to your Supabase project:

```bash
pnpm run supabase:link
```

Or manually:
```bash
supabase link --project-ref wqfbltrnlwngyohvxjjq
```

This will prompt you to log in to Supabase and link your project. You'll need your access token from the Supabase dashboard.

## Step 2: Environment Variables

The `.env` file has been created with your credentials:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your anonymous/public key (safe for client-side)
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (server-side only, never expose to client)

**Important**: The `.env` file is already in `.gitignore` and will not be committed to version control.

## Step 3: Create and Run Migrations

### Create a New Migration

To create a new migration file:

```bash
pnpm run supabase:migration:new migration_name
```

Or manually:
```bash
supabase migration new migration_name
```

This will create a new migration file in `supabase/migrations/` with a timestamp prefix.

### Push Migrations to Supabase

To apply all migrations to your remote Supabase project:

```bash
pnpm run supabase:db:push
```

Or manually:
```bash
supabase db push
```

This will:
- Apply all pending migrations from `supabase/migrations/` to your remote database
- Create all tables, policies, and other database objects defined in the migrations

### Initial Schema

The initial schema migration (`20250101000000_initial_schema.sql`) includes:
- `employees` table
- `attendance_logs` table
- `leave_requests` table
- `payroll_cycles` table
- Row Level Security (RLS) policies
- Sample data

## Step 4: Verify Connection

After linking and pushing migrations, verify your connection:

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. The Supabase client in `client/src/services/supabase.ts` will automatically use the environment variables from your `.env` file.

## Common Commands

### Check Supabase Status
```bash
pnpm run supabase:status
```

### Reset Database (⚠️ WARNING: This will delete all data)
```bash
pnpm run supabase:db:reset
```

### Create a New Migration
```bash
pnpm run supabase:migration:new add_new_table
```

### Push Migrations
```bash
pnpm run supabase:db:push
```

### Pull Remote Schema Changes
```bash
supabase db pull
```

### Generate TypeScript Types
```bash
supabase gen types typescript --project-id wqfbltrnlwngyohvxjjq > client/src/types/supabase.ts
```

## Project Structure

```
supabase/
├── migrations/
│   └── 20250101000000_initial_schema.sql  # Initial database schema
└── config.toml                            # Supabase config (auto-generated)
```

## Troubleshooting

### Authentication Issues
If you encounter authentication errors:
1. Make sure you're logged in: `supabase login`
2. Verify your project ref is correct: `wqfbltrnlwngyohvxjjq`

### Migration Errors
- Check that your migration SQL is valid
- Ensure you're not trying to create tables that already exist
- Use `supabase db reset` to start fresh (⚠️ deletes all data)

### Environment Variables Not Loading
- Make sure `.env` file is in the project root (not in `client/`)
- Restart your dev server after changing `.env`
- Vite requires `VITE_` prefix for client-side variables

## Next Steps

1. ✅ Link your project: `pnpm run supabase:link`
2. ✅ Push initial migration: `pnpm run supabase:db:push`
3. ✅ Verify connection in your app
4. Create additional migrations as needed for new features

## Security Notes

- **Never commit** `.env` file to version control
- **Never expose** `SUPABASE_SERVICE_ROLE_KEY` to the client
- Use Row Level Security (RLS) policies to secure your data
- The `anon` key is safe for client-side use but should still be protected with RLS

