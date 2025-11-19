# Railway Backend Deployment Guide

## Quick Setup

### 1. Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Choose your repository: `Stepan3301/utyagifts`

### 2. Configure Backend Service

Railway will detect both frontend and backend. You need to configure the backend service:

1. Click on the **@rocket-gifts/backend** service
2. Go to **Settings** tab
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm start`

### 3. Set Environment Variables

Go to **Variables** tab and add:

#### Required Variables:

```env
# Supabase Database
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
TELEGRAM_BOT_USERNAME=your_bot_username

# Web App URL (your GitHub Pages or Netlify URL)
WEBAPP_URL=https://stepan3301.github.io/utyagifts

# Optional: Webhook URL (Railway will provide this after deployment)
TELEGRAM_WEBHOOK_URL=https://your-backend.railway.app/api/telegram/webhook

# Server (Railway sets PORT automatically)
NODE_ENV=production
```

### 4. Deploy

Railway will automatically:
1. Install dependencies (`npm install`)
2. Build TypeScript (`npm run build`)
3. Start the server (`npm start`)

## Configuration Files

### `railway.json` (Root)
- Configures Railway to build from `backend` directory
- Sets build and start commands

### `backend/nixpacks.toml`
- Alternative build configuration
- Ensures Node.js 20 is used
- Configures build phases

## Important Notes

### TypeScript in Dependencies

TypeScript has been moved to `dependencies` (instead of `devDependencies`) because:
- Railway needs it during the build phase
- Build tools are required at build time, not just runtime

### Root Directory

Make sure Railway is set to use `backend` as the root directory:
- Settings → Root Directory → `backend`

### Port Configuration

Railway automatically sets the `PORT` environment variable. Your Express server should use:
```typescript
const PORT = process.env.PORT || 4000;
```

This is already configured in `backend/src/index.ts`.

## Troubleshooting

### Build Fails: "tsc: not found"

✅ **Fixed**: TypeScript is now in `dependencies` instead of `devDependencies`

If you still see this error:
1. Check Root Directory is set to `backend`
2. Verify `package.json` has TypeScript in dependencies
3. Check build logs for installation errors

### Service Won't Start

1. Check **Deploy Logs** (not Build Logs)
2. Verify `dist/index.js` exists after build
3. Check that `PORT` environment variable is set (Railway sets this automatically)
4. Verify all required environment variables are set

### Database Connection Fails

1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
2. Check Supabase project is active
3. Verify network access from Railway to Supabase

### Telegram Bot Not Working

1. Verify `TELEGRAM_BOT_TOKEN` is correct
2. Check `WEBAPP_URL` points to your frontend
3. If using webhooks, set `TELEGRAM_WEBHOOK_URL` after getting Railway URL
4. Check Railway logs for bot initialization errors

## After Deployment

1. **Get Your Backend URL**:
   - Railway will provide: `https://your-service.railway.app`
   - This is your backend API URL

2. **Update Frontend**:
   - Set GitHub Secret: `NEXT_PUBLIC_API_BASE_URL=https://your-service.railway.app/api`
   - Or if using Netlify: Set environment variable with same value

3. **Update Telegram Webhook** (Optional):
   - Set `TELEGRAM_WEBHOOK_URL` in Railway variables
   - Or leave empty to use polling mode

4. **Test**:
   - Visit your backend health endpoint: `https://your-service.railway.app/api/health`
   - Check Railway logs for any errors

## Railway vs Other Platforms

| Feature | Railway | Render | Fly.io |
|---------|---------|--------|--------|
| Free Tier | $5/month credit | Limited | Limited |
| Setup | Easy | Easy | Medium |
| Auto Deploy | Yes | Yes | Yes |
| Environment Variables | Easy UI | Easy UI | CLI/UI |

Railway is recommended for ease of use and good free tier.

