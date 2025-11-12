# Migrating from Prisma to Supabase Client SDK

This guide will help you complete the migration from Prisma to Supabase client SDK.

## ✅ What's Already Done

- ✅ Installed `@supabase/supabase-js` package
- ✅ Created Supabase client configuration (`backend/src/lib/supabase.ts`)
- ✅ Replaced all Prisma queries with Supabase queries in repositories
- ✅ Created TypeScript types for database models
- ✅ Created SQL migration file for database setup

## 📋 Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
# or
pnpm install
```

This will install `@supabase/supabase-js`.

### 2. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → This is your `SUPABASE_URL`
   - **anon public** key → This is your `SUPABASE_ANON_KEY`

### 3. Update Environment Variables

Edit `backend/.env`:

```env
# REQUIRED: Supabase Client Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: For direct SQL access (if needed)
# DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

### 4. Set Up Database Tables

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Open `backend/supabase/migrations/001_initial_schema.sql`
4. Copy and paste the entire SQL content
5. Click **Run** (or press `Cmd/Ctrl + Enter`)

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
cd backend/supabase
supabase db push
```

### 5. Verify Tables Are Created

1. Go to Supabase Dashboard → **Table Editor**
2. You should see three tables:
   - `User`
   - `Gift`
   - `GameSession`

### 6. Test Your Application

```bash
# Start backend
cd backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev
```

## 🔄 Code Changes Summary

### Before (Prisma):
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const user = await prisma.user.findUnique({
  where: { telegramId: 123 }
})
```

### After (Supabase):
```typescript
import { supabase } from '../lib/supabase'

const { data: user } = await supabase
  .from('User')
  .select('*')
  .eq('telegramId', 123)
  .single()
```

## 📁 File Changes

### New Files Created:
- `backend/src/lib/supabase.ts` - Supabase client configuration
- `backend/supabase/migrations/001_initial_schema.sql` - Database schema
- `backend/supabase/README.md` - Migration setup guide

### Files Updated:
- `backend/package.json` - Added `@supabase/supabase-js`, removed `@prisma/client`
- `backend/src/repositories/userRepository.ts` - Replaced Prisma with Supabase
- `backend/src/repositories/giftRepository.ts` - Replaced Prisma with Supabase
- `backend/src/repositories/gameSessionRepository.ts` - Replaced Prisma with Supabase
- `backend/.env.example` - Added `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Files You Can Remove (Optional):
- `backend/prisma/` - Prisma schema and migrations (no longer needed)
- You can keep them for reference, but they won't be used

## 🎯 Benefits of Supabase Client SDK

1. **Real-time Subscriptions** - Subscribe to database changes in real-time
2. **Storage** - Built-in file storage
3. **Auth** - User authentication (if needed later)
4. **Direct Client Access** - Query database from frontend (with RLS)
5. **Type Safety** - Full TypeScript support

## 🔍 Troubleshooting

### Error: "Missing SUPABASE_URL environment variable"
- Make sure you've set `SUPABASE_URL` in your `.env` file
- Restart your dev server after adding environment variables

### Error: "relation 'User' does not exist"
- Run the SQL migration in Supabase Dashboard
- Check that table names match exactly (case-sensitive)

### Error: "permission denied"
- Make sure you're using the `anon` key (not `service_role`)
- Check Row Level Security (RLS) policies if enabled

### Tables not showing up
- Refresh the Supabase Dashboard
- Check the SQL Editor for any errors
- Verify you're looking at the correct project

## 🚀 Next Steps

1. ✅ Complete the setup steps above
2. ✅ Test your application
3. 🎉 You're now using Supabase client SDK!

### Optional Enhancements:

- **Real-time Subscriptions**: Subscribe to game sessions in real-time
- **Storage**: Store gift thumbnails in Supabase Storage
- **Row Level Security**: Add RLS policies for data protection
- **Frontend Integration**: Use Supabase client in your frontend for direct queries

## 📚 Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Real-time Guide](https://supabase.com/docs/guides/realtime)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)

## ⚠️ Important Notes

- **Never commit your `.env` file** - It contains sensitive keys
- **Use `anon` key for client-side** - `service_role` key should only be used server-side
- **Table names are case-sensitive** - Make sure they match exactly
- **RLS is disabled by default** - Enable it for production security

