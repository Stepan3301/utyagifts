# Netlify Deployment Guide

## Quick Setup

### 1. Fill in Netlify Build Settings

When setting up your project on Netlify, use these settings:

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/out`
- **Functions directory**: (leave empty or use `netlify/functions`)

### 2. Set Environment Variables

Go to **Site settings** → **Environment variables** and add:

#### Required:
- `NEXT_PUBLIC_API_BASE_URL` - Your backend API URL (e.g., `https://your-backend.railway.app/api`)
- `NODE_ENV` - Set to `production`

#### Optional:
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - Your bot username (without @)

### 3. Deploy

1. Click **Deploy site**
2. Netlify will automatically:
   - Install dependencies in the `frontend` directory
   - Run `npm run build`
   - Deploy the `frontend/out` directory

## Configuration Files

### `netlify.toml`

This file is already created in the root directory and contains:
- Build settings
- Publish directory
- Node version

### `next.config.js`

The Next.js config is set up to:
- Export static files (`output: 'export'`)
- Work with both GitHub Pages and Netlify
- Use basePath only for GitHub Pages (not Netlify)

## Important Notes

### Backend Deployment

⚠️ **Netlify only hosts your frontend**. You still need to deploy your backend separately to:
- Railway
- Render
- Fly.io
- Your own VPS

Set backend environment variables on your backend hosting platform:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `TELEGRAM_BOT_TOKEN`
- `WEBAPP_URL` (should be your Netlify URL: `https://utyagifts.netlify.app`)

### Environment Variables

- **Frontend variables** → Set in Netlify dashboard (Site settings → Environment variables)
- **Backend variables** → Set on your backend hosting platform
- **Database credentials** → Set on backend hosting (never in frontend)

## After Deployment

1. **Update Telegram Bot**:
   - Set `WEBAPP_URL` in your backend to: `https://utyagifts.netlify.app`
   - Update bot menu button to point to Netlify URL

2. **Update Backend CORS**:
   - Make sure your backend allows requests from `https://utyagifts.netlify.app`

3. **Test**:
   - Open `https://utyagifts.netlify.app` in browser
   - Check console for any errors
   - Test user registration flow

## Troubleshooting

### Build Fails

- Check that `base` directory is set to `frontend`
- Verify `package.json` exists in `frontend` directory
- Check build logs in Netlify dashboard

### Assets Not Loading

- Verify `publish` directory is `frontend/out`
- Check that Next.js build completed successfully
- Clear browser cache

### API Calls Fail

- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly in Netlify
- Check backend is deployed and accessible
- Verify CORS settings on backend allow Netlify domain

### User Registration Not Working

- Check backend is deployed and running
- Verify `NEXT_PUBLIC_API_BASE_URL` points to correct backend
- Check backend logs for errors
- Verify Supabase connection from backend

## Comparison: Netlify vs GitHub Pages

| Feature | Netlify | GitHub Pages |
|---------|---------|--------------|
| Setup | Easier (GUI) | Requires GitHub Actions |
| Environment Variables | Built-in UI | GitHub Secrets |
| Custom Domain | Easy | Possible |
| Functions | Built-in | Not available |
| Build Time | Faster | Slower |
| Cost | Free tier available | Free |

Both work great for static Next.js apps!

