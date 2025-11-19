# Railway Environment Variables Setup

## Backend Service Environment Variables

Your backend is crashing because environment variables are not set in Railway. Follow these steps:

### Step 1: Go to Railway Dashboard

1. Open your Railway project: https://railway.app/project/[your-project-id]
2. Click on the **@rocket-gifts/backend** service
3. Go to the **Variables** tab

### Step 2: Add Required Environment Variables

Click **New Variable** and add each of these:

#### Required Variables:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
TELEGRAM_BOT_USERNAME=your_bot_username
WEBAPP_URL=https://stepan3301.github.io/utyagifts
NODE_ENV=production
```

#### Optional Variables:

```env
TELEGRAM_WEBHOOK_URL=https://your-backend.railway.app/api/telegram/webhook
RELAYER_TELEGRAM_ID=your-relayer-telegram-id
PORT=4000
```

### Step 3: Get Your Values

#### SUPABASE_URL and SUPABASE_ANON_KEY:
1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → Use as `SUPABASE_URL`
   - **anon public** key → Use as `SUPABASE_ANON_KEY`

#### TELEGRAM_BOT_TOKEN:
1. Open Telegram and search for `@BotFather`
2. Send `/mybots`
3. Select your bot
4. Click **API Token**
5. Copy the token → Use as `TELEGRAM_BOT_TOKEN`

#### TELEGRAM_BOT_USERNAME:
- Your bot's username (without @)
- Example: `your_bot_username`

#### WEBAPP_URL:
- Your GitHub Pages URL: `https://stepan3301.github.io/utyagifts`
- Or your Netlify URL if using Netlify

#### TELEGRAM_WEBHOOK_URL (Optional):
- Set this AFTER your backend is deployed
- Format: `https://your-backend.railway.app/api/telegram/webhook`
- Railway will provide your backend URL after first successful deployment

### Step 4: Redeploy

After adding all variables:
1. Railway will automatically redeploy
2. Or manually trigger redeploy: Click **Deploy** → **Redeploy**

### Step 5: Verify

Check the **Deploy Logs** tab:
- Should see: `🚀 Server running on port [PORT]`
- No errors about missing environment variables

## Frontend Service (Remove from Railway)

**Important**: You're deploying frontend to GitHub Pages, so you should **remove the frontend service from Railway**:

1. Go to Railway project
2. Click on **@rocket-gifts/frontend** service
3. Go to **Settings** tab
4. Scroll down and click **Delete Service**
5. Confirm deletion

This will prevent Railway from trying to build your frontend (which is handled by GitHub Actions).

## Troubleshooting

### Backend Still Crashing

1. **Check Variables Tab**: Make sure all variables are set correctly
2. **Check Variable Names**: Must be exact (case-sensitive):
   - `SUPABASE_URL` (not `SUPABASE_URLS` or `supabase_url`)
   - `SUPABASE_ANON_KEY` (not `SUPABASE_KEY`)
3. **Check Deploy Logs**: Look for specific error messages
4. **Verify Supabase Connection**: Make sure your Supabase project is active

### Variables Not Appearing

- Make sure you're in the correct service (`@rocket-gifts/backend`)
- Refresh the page
- Check that you're in the correct environment (`production`)

### Backend URL Not Working

- Wait for deployment to complete (check Deploy Logs)
- Get your Railway backend URL from the service **Settings** → **Networking**
- Use this URL for `NEXT_PUBLIC_API_BASE_URL` in GitHub Secrets

