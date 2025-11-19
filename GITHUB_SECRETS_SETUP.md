# GitHub Secrets Setup Guide

## Overview

Since GitHub Pages only serves **static files**, environment variables need to be handled differently:

1. **Frontend (GitHub Pages)**: Environment variables are baked into the build using GitHub Secrets
2. **Backend (Separate Hosting)**: Environment variables are set on your backend hosting platform (Railway, Render, etc.)

---

## Part 1: Frontend Environment Variables (GitHub Secrets)

The frontend needs these variables **baked into the build** during GitHub Actions:

### Required GitHub Secrets

1. Go to your repository: https://github.com/Stepan3301/utyagifts
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

#### `NEXT_PUBLIC_API_BASE_URL`
- **Value**: Your deployed backend API URL
- **Example**: `https://your-backend.railway.app/api` or `https://api.yourdomain.com/api`
- **Important**: Must be HTTPS and include `/api` at the end
- **Note**: This is the URL where your backend server is deployed (NOT GitHub Pages)

#### `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` (Optional)
- **Value**: Your Telegram bot username (without @)
- **Example**: `your_bot_username`
- **Note**: Only needed if you use it in the frontend

### How It Works

When you push to GitHub:
1. GitHub Actions workflow runs
2. It reads these secrets during the build step
3. Next.js bakes them into the static files as `process.env.NEXT_PUBLIC_*`
4. The built files are deployed to GitHub Pages

**Important**: These values become part of the built JavaScript files, so they're public. Only use `NEXT_PUBLIC_*` for values that are safe to expose.

---

## Part 2: Backend Environment Variables

**GitHub Pages CANNOT run your backend server.** You need to deploy your backend separately.

### Backend Hosting Options

1. **Railway** (Recommended - Easy setup)
2. **Render** (Free tier available)
3. **Fly.io** (Good for Node.js)
4. **Heroku** (Paid)
5. **Your own VPS** (DigitalOcean, AWS, etc.)

### Backend Environment Variables

Set these on your backend hosting platform (NOT in GitHub Secrets):

#### Required Variables:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_WEBHOOK_URL=https://your-backend.railway.app/api/telegram/webhook
WEBAPP_URL=https://stepan3301.github.io/utyagifts

# Supabase Database
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server
PORT=4000
NODE_ENV=production
```

### Where to Set Backend Variables

**Railway:**
1. Go to your project → **Variables** tab
2. Add each variable as a key-value pair

**Render:**
1. Go to your service → **Environment** tab
2. Add environment variables

**Fly.io:**
```bash
fly secrets set TELEGRAM_BOT_TOKEN=your-token
fly secrets set SUPABASE_URL=your-url
# etc.
```

---

## Quick Setup Checklist

### ✅ Frontend (GitHub Pages)

- [ ] Go to GitHub repo → Settings → Secrets and variables → Actions
- [ ] Add `NEXT_PUBLIC_API_BASE_URL` secret (your backend URL)
- [ ] Add `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` secret (optional)
- [ ] Push to main branch to trigger build
- [ ] Check Actions tab to verify build succeeded

### ✅ Backend (Separate Hosting)

- [ ] Deploy backend to Railway/Render/etc.
- [ ] Set all backend environment variables on hosting platform
- [ ] Get your backend URL (e.g., `https://your-backend.railway.app`)
- [ ] Update `NEXT_PUBLIC_API_BASE_URL` GitHub Secret with backend URL
- [ ] Update `TELEGRAM_WEBHOOK_URL` in backend env vars
- [ ] Update `WEBAPP_URL` in backend env vars to GitHub Pages URL

---

## Current Issue: Backend Not Running

The error `ERR_CONNECTION_REFUSED localhost:4000` means:

1. **For Local Development**: Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. **For Production**: 
   - Deploy your backend to Railway/Render/etc.
   - Update `NEXT_PUBLIC_API_BASE_URL` GitHub Secret to point to deployed backend
   - Rebuild and redeploy frontend

---

## Example Configuration

### Frontend (GitHub Pages)
- **URL**: `https://stepan3301.github.io/utyagifts`
- **GitHub Secret**: `NEXT_PUBLIC_API_BASE_URL=https://rocket-gifts-backend.railway.app/api`

### Backend (Railway)
- **URL**: `https://rocket-gifts-backend.railway.app`
- **Environment Variables**:
  - `WEBAPP_URL=https://stepan3301.github.io/utyagifts`
  - `TELEGRAM_WEBHOOK_URL=https://rocket-gifts-backend.railway.app/api/telegram/webhook`
  - `SUPABASE_URL=...`
  - `SUPABASE_ANON_KEY=...`

---

## Important Notes

1. **Never commit `.env` files** - They're in `.gitignore` for a reason
2. **Backend secrets stay on backend hosting** - Don't put them in GitHub Secrets
3. **Frontend public vars go in GitHub Secrets** - Only `NEXT_PUBLIC_*` variables
4. **Backend must be deployed separately** - GitHub Pages is static only
5. **Use HTTPS everywhere** - Telegram requires HTTPS for web apps

---

## Troubleshooting

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_BASE_URL` GitHub Secret is set correctly
- Verify backend is deployed and running
- Check backend CORS settings allow GitHub Pages origin

### Backend can't connect to database
- Verify Supabase credentials are set on backend hosting platform
- Check Supabase project is active
- Verify network access from backend hosting to Supabase

### User registration not working
- Check backend is deployed and accessible
- Verify `NEXT_PUBLIC_API_BASE_URL` points to correct backend URL
- Check backend logs for errors
- Verify Supabase connection from backend

