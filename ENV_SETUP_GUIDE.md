# Environment Variables Setup Guide

## Understanding the URLs

### 1. **TELEGRAM_WEBHOOK_URL** (Optional for Development)

**What it is:**
- This is the URL where Telegram sends bot updates (messages, commands, etc.) to your backend
- You don't "get" this URL - you **create it** by deploying your backend server

**For Development (Local):**
- **Leave it EMPTY or don't set it** - The bot will use "polling mode" instead
- Polling mode means your bot actively checks Telegram for new messages
- This works perfectly for local development

**For Production:**
- Set it to: `https://your-domain.com/api/telegram/webhook`
- Replace `your-domain.com` with your actual domain
- Example: `https://rocket-gifts.com/api/telegram/webhook`
- **Important:** Must be HTTPS (not HTTP) for production
- Your backend server must be publicly accessible

**How to set it up:**
1. Deploy your backend to a server (e.g., VPS, Heroku, Railway, etc.)
2. Make sure your domain has SSL/HTTPS
3. Set the webhook URL to point to your deployed backend
4. The bot will automatically use webhook mode if this is set

---

### 2. **WEBAPP_URL** (Required)

**What it is:**
- This is the URL of your **frontend web app** (the Next.js app)
- This is what opens when users click the "Launch App" button in Telegram

**For Development (Local):**
- Set it to: `http://localhost:3000`
- This is where your Next.js frontend runs locally
- **Note:** For local testing, you'll need to use a tool like `ngrok` to expose localhost to Telegram (see below)

**For Production:**
- Set it to your deployed frontend URL
- Example: `https://app.rocket-gifts.com` or `https://rocket-gifts.com/app`
- **Important:** Must be HTTPS for production
- Telegram requires HTTPS for web apps

---

## Quick Setup for Development

### Option 1: Local Development (Recommended to start)

1. **Create `backend/.env`:**
```bash
cd backend
cp .env.example .env
```

2. **Edit `backend/.env` and set:**
```env
# Leave TELEGRAM_WEBHOOK_URL empty or commented out for local dev
# TELEGRAM_WEBHOOK_URL=

# Set WEBAPP_URL to localhost (or use ngrok - see Option 2)
WEBAPP_URL=http://localhost:3000

# Your bot token from @BotFather
TELEGRAM_BOT_TOKEN=your-bot-token-here

# Other required variables...
```

3. **Start your servers:**
```bash
# Terminal 1: Start backend
cd backend
pnpm dev

# Terminal 2: Start frontend  
cd frontend
pnpm dev
```

4. **For Telegram to access localhost, use ngrok:**
```bash
# Install ngrok: https://ngrok.com/download
# Expose your frontend
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update WEBAPP_URL in backend/.env:
WEBAPP_URL=https://abc123.ngrok.io
```

### Option 2: Production Setup

1. **Deploy your frontend** (e.g., Vercel, Netlify, your own server)
   - Get your frontend URL: `https://your-app.com`

2. **Deploy your backend** (e.g., Railway, Heroku, your own VPS)
   - Get your backend URL: `https://api.your-app.com`

3. **Set environment variables:**

**Backend `.env`:**
```env
TELEGRAM_WEBHOOK_URL=https://api.your-app.com/api/telegram/webhook
WEBAPP_URL=https://your-app.com
TELEGRAM_BOT_TOKEN=your-bot-token
# ... other variables
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_BASE_URL=https://api.your-app.com/api
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

---

## Summary

| Variable | Development | Production |
|----------|------------|------------|
| `TELEGRAM_WEBHOOK_URL` | Leave empty (use polling) | `https://your-api.com/api/telegram/webhook` |
| `WEBAPP_URL` | `http://localhost:3000` (or ngrok URL) | `https://your-app.com` |

**Remember:**
- Webhook URL = Your backend server endpoint
- WebApp URL = Your frontend application URL
- For local dev, webhook is optional (polling works)
- For production, both need HTTPS

