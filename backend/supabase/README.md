# Supabase Database Setup

This directory contains SQL migrations for setting up your Supabase database.

## Quick Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `migrations/001_initial_schema.sql`
5. Click **Run** (or press `Cmd/Ctrl + Enter`)

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Migration Files

- `001_initial_schema.sql` - Creates initial database schema with User, Gift, and GameSession tables

## What Gets Created

### Tables
- **User** - Stores Telegram user information
- **Gift** - Stores gift data
- **GameSession** - Stores game session data

### Indexes
- Indexes on frequently queried columns for better performance

### Triggers
- Automatic `updatedAt` timestamp updates on all tables

## Verifying Setup

After running the migration:

1. Go to Supabase Dashboard → **Table Editor**
2. You should see three tables: `User`, `Gift`, `GameSession`
3. Check that indexes and triggers are created in **Database** → **Database** section

## Troubleshooting

### Error: "relation already exists"
- Tables already exist, you can skip this migration or drop tables first

### Error: "permission denied"
- Make sure you're using the correct Supabase project
- Check that your API keys have the right permissions

### Need to reset?
- Go to Supabase Dashboard → **Settings** → **Database** → **Reset Database** (⚠️ This deletes all data!)

