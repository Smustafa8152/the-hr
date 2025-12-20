# Supabase Quick Start

## 🚀 Quick Setup (3 Steps)

### 1. Install Supabase CLI (if not installed)
```bash
npm install -g supabase
# or
pnpm add -g supabase
```

### 2. Link Your Project
```bash
pnpm run supabase:link
```
This will connect your local project to your Supabase project (ref: `wqfbltrnlwngyohvxjjq`)

### 3. Push Database Schema
```bash
pnpm run supabase:db:push
```
This will create all tables in your Supabase database from the migration files.

## ✅ Done!

Your project is now connected to Supabase. The `.env` file is already configured with your credentials.

## 📝 Common Commands

| Command | Description |
|---------|-------------|
| `pnpm run supabase:link` | Link project to Supabase |
| `pnpm run supabase:db:push` | Push migrations to database |
| `pnpm run supabase:migration:new <name>` | Create new migration |
| `pnpm run supabase:status` | Check Supabase status |
| `pnpm run supabase:db:reset` | ⚠️ Reset database (deletes all data) |

## 📁 Migration Files

All migrations are in `supabase/migrations/`:
- `20250101000000_initial_schema.sql` - Creates employees, attendance_logs, leave_requests, and payroll_cycles tables

## 🔐 Environment Variables

Your `.env` file contains:
- `VITE_SUPABASE_URL` - Your project URL
- `VITE_SUPABASE_ANON_KEY` - Public key (safe for client)
- `SUPABASE_SERVICE_ROLE_KEY` - Service key (server-side only)

**Note**: `.env` is in `.gitignore` and won't be committed.

## 🆘 Troubleshooting

**Can't link?**
- Make sure you're logged in: `supabase login`
- Verify project ref: `wqfbltrnlwngyohvxjjq`

**Migration errors?**
- Check SQL syntax in migration files
- Use `supabase db reset` to start fresh (⚠️ deletes data)

**Environment variables not working?**
- Restart dev server after changing `.env`
- Make sure `.env` is in project root

