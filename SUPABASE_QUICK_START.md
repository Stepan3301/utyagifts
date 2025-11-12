# Supabase Quick Start - TL;DR

## 🚀 Quick Setup (5 minutes)

### 1. Create Supabase Project
- Go to https://supabase.com → Sign up/Login
- Click "New Project"
- Name: `rocket-gifts`
- Set database password (save it!)
- Choose region → Create

### 2. Get Connection String
- Dashboard → Settings → Database
- Copy the **Connection String** (URI format)
- It looks like: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
- Replace `[PASSWORD]` with your actual password

### 3. Update `.env`
```bash
cd backend
cp .env.example .env
```

Edit `.env` and add:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
```

### 4. Run Migrations
```bash
cd backend
npm run db:push
# or: pnpm db:push
```

### 5. Start App
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Done! ✅

---

## 📋 Environment Variables You Need

### Required for Supabase (Prisma setup):
```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

### Optional (only if using Supabase client SDK):
```env
# ❌ NOT NEEDED for Prisma-only setup
# Only add these if you want to use Supabase client SDK, real-time, storage, etc.
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### You can DELETE these (not needed with Supabase):
```env
# ❌ Remove these
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

---

## 🔧 How to Use in Code

**Good news:** Your existing code already works! No changes needed.

```typescript
// This all works automatically with Supabase:
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Create
await prisma.user.create({ data: { ... } })

// Read
await prisma.user.findUnique({ where: { ... } })

// Update
await prisma.user.update({ where: { ... }, data: { ... } })

// Delete
await prisma.user.delete({ where: { ... } })
```

---

## 🐛 Troubleshooting

### Can't connect?
```bash
# Check your connection string is correct
# Make sure password doesn't have special characters
# If it does, wrap DATABASE_URL in quotes
DATABASE_URL="postgresql://..."
```

### Tables not created?
```bash
# Run migrations
cd backend
npm run db:push
```

### Want to see your data?
```bash
# Open Prisma Studio
npm run db:studio

# Or check Supabase Dashboard → Table Editor
```

---

## 📚 Full Documentation
See `SUPABASE_SETUP.md` for detailed instructions.

