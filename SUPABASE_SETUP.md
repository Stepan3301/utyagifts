# Supabase Setup Guide

This guide will help you set up Supabase as your database for the Rocket Gifts project.

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- PostgreSQL database (fully compatible with Prisma)
- Real-time subscriptions
- Authentication (optional)
- Storage (optional)
- Auto-generated APIs

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in the details:
   - **Name**: `rocket-gifts` (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is perfect to start
5. Click "Create new project"
6. Wait 1-2 minutes for your project to be set up

## Step 2: Get Your Database Connection String

### Option A: Direct Connection (Recommended for Production)

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Select **URI** tab
4. Copy the connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you created in Step 1

### Option B: Connection Pooling (Recommended for Serverless/High Traffic)

1. In **Settings** → **Database**
2. Under **Connection string**, select **Connection pooling** → **Transaction mode**
3. Copy the connection string that looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your database password

**When to use each:**
- **Direct Connection**: For local development, background jobs, migrations
- **Connection Pooling**: For serverless deployments (Vercel, Netlify), high-traffic apps

## Step 3: Do You Need Supabase URL and Anon Key?

### Short Answer: **NO, not for basic Prisma setup**

If you're **only using Prisma** (like this project), you **don't need**:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

You **only need** `DATABASE_URL` (the PostgreSQL connection string).

### When You WOULD Need Them:

You'd need `SUPABASE_URL` and `SUPABASE_ANON_KEY` if you want to:
- Use Supabase client SDK (`@supabase/supabase-js`) in your frontend
- Enable real-time subscriptions
- Use Supabase Storage
- Use Supabase Auth
- Make direct database queries from client-side code

**For this project:** You're using Prisma on the backend, so you don't need them.

### How to Get Them (If Needed Later):

1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** → This is your `SUPABASE_URL`
   - **anon public** key → This is your `SUPABASE_ANON_KEY`

Then add to `.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 4: Update Your `.env` File

### Backend Environment Variables

Create or update `backend/.env`:

```bash
# Copy the example file
cd backend
cp .env.example .env
```

Edit `backend/.env` and add/update these variables:

```env
# ============================================
# SUPABASE DATABASE CONFIGURATION
# ============================================

# Full database connection URL from Supabase
# Replace with your actual connection string from Step 2
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"

# Optional: If using connection pooling for production
# Uncomment this for serverless deployments
# DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Optional: Direct connection URL (for migrations if using pooling)
# Only needed if you're using connection pooling above
# DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"

# ============================================
# OTHER CONFIGURATION
# ============================================

NODE_ENV=development
PORT=4000

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
TELEGRAM_BOT_USERNAME=your_bot_username

# Leave empty for local dev (uses polling mode)
# TELEGRAM_WEBHOOK_URL=

RELAYER_TELEGRAM_ID=your-telegram-id

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# WebApp URL - your frontend URL
WEBAPP_URL=http://localhost:8000

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production
```

### Important Notes:

1. **Remove old database variables** - When using Supabase, you don't need:
   ```env
   # ❌ Remove these - not needed with Supabase
   # DB_HOST=localhost
   # DB_PORT=5432
   # DB_USER=rocket_user
   # DB_PASSWORD=strongpassword
   # DB_NAME=rocket_gifts
   ```

2. **Connection string format**:
   - Must be wrapped in quotes if it contains special characters
   - Must start with `postgresql://` or `postgres://`

## Step 5: Update Prisma Schema (If Using Connection Pooling)

If you're using connection pooling for production, update `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Add this line if using connection pooling
}
```

**Only add `directUrl` if you're using connection pooling.** For most cases, just `url` is enough.

## Step 6: Run Database Migrations

Now that your database is connected, set up your schema:

```bash
# Navigate to backend directory
cd backend

# Generate Prisma Client
npm run db:generate
# or
pnpm db:generate

# Push the schema to Supabase (creates tables)
npm run db:push
# or
pnpm db:push

# Alternative: Use migrations (recommended for production)
npm run db:migrate
# or
pnpm db:migrate
```

You should see output like:
```
✓ Generated Prisma Client
Your database is now in sync with your Prisma schema.
```

## Step 7: Verify the Connection

1. **Check in Supabase Dashboard**:
   - Go to **Table Editor** in your Supabase project
   - You should see tables: `User`, `Gift`, `GameSession`

2. **Test with Prisma Studio** (optional):
   ```bash
   npm run db:studio
   # or
   pnpm db:studio
   ```
   This opens a visual database editor at `http://localhost:5555`

## Step 8: Start Your Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev
# or
pnpm dev

# Terminal 2: Start frontend
cd frontend
npm run dev
# or
pnpm dev
```

Your app should now be connected to Supabase! 🎉

## How to Call Supabase in Your Code

Good news! **You don't need to change your code at all.** Your existing Prisma code automatically works with Supabase because:

1. Supabase uses PostgreSQL
2. Prisma connects via `DATABASE_URL`
3. Your existing models and queries work as-is

### Example Usage (Already in Your Code):

```typescript
// backend/src/repositories/userRepository.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create a user
const user = await prisma.user.create({
  data: {
    telegramId: 123456789,
    username: 'john_doe',
    firstName: 'John',
  }
})

// Find a user
const foundUser = await prisma.user.findUnique({
  where: { telegramId: 123456789 }
})

// Update a user
const updated = await prisma.user.update({
  where: { id: user.id },
  data: { lastName: 'Smith' }
})
```

All your existing Prisma code works exactly the same way!

## Optional: Supabase Features

While you're using Prisma for your main database operations, Supabase offers additional features:

### 1. Real-time Subscriptions (Optional)
Subscribe to database changes in real-time:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Listen to game sessions
supabase
  .channel('game-sessions')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'GameSession'
  }, (payload) => {
    console.log('New game session:', payload)
  })
  .subscribe()
```

### 2. Direct SQL Queries (Optional)
Run raw SQL through Supabase Dashboard:
- Go to **SQL Editor** in your project
- Write and execute SQL queries
- Useful for analytics and debugging

### 3. Row Level Security (Optional)
Add security policies directly in Supabase:
- Go to **Authentication** → **Policies**
- Add RLS policies to protect your data
- Works alongside your Express API

## Troubleshooting

### Error: "P1001: Can't reach database server"
- Check your `DATABASE_URL` is correct
- Verify your database password
- Check if your IP is allowed (Supabase allows all IPs by default)
- Make sure you're connected to the internet

### Error: "SSL connection required"
Add `?sslmode=require` to your connection string:
```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?sslmode=require"
```

### Error: "Too many connections"
- Use connection pooling (see Option B in Step 2)
- Or reduce your Prisma connection pool size in `schema.prisma`

### Error: "relation does not exist"
- Run migrations: `npm run db:push` or `npm run db:migrate`
- Check you're using the correct schema in Prisma

### Can't see tables in Supabase Dashboard
- Make sure migrations ran successfully
- Refresh the Table Editor page
- Check the schema (default is `public`)

## Environment Variables Summary

Here's the complete list of environment variables you need:

### Required:
- `DATABASE_URL` - Your Supabase PostgreSQL connection string

### Optional (if using connection pooling):
- `DIRECT_URL` - Direct connection for migrations

### Not needed with Supabase:
- ❌ `DB_HOST`
- ❌ `DB_PORT`
- ❌ `DB_USER`
- ❌ `DB_PASSWORD`
- ❌ `DB_NAME`

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Update `.env` with `DATABASE_URL`
3. ✅ Run migrations
4. ✅ Test your application
5. 🚀 Deploy to production (both frontend and backend)
6. 📊 Monitor your database in Supabase Dashboard

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

## Support

If you run into issues:
1. Check the Troubleshooting section above
2. Review the [Supabase Community](https://github.com/supabase/supabase/discussions)
3. Check [Prisma Docs](https://www.prisma.io/docs)

