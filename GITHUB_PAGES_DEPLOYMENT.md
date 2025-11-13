# GitHub Pages Deployment Guide

## Why You're Seeing the README Instead of Your App

GitHub Pages is currently showing your `README.md` file because:

1. **GitHub Pages defaults to showing README.md** when no website files are found
2. **Next.js apps need to be built and exported** as static files before deployment
3. **GitHub Pages needs to be configured** to serve from the correct directory

## Solution: Automated Deployment with GitHub Actions

I've set up an automated deployment workflow that will:
- Build your Next.js app as static files
- Deploy them to GitHub Pages automatically
- Update whenever you push to the `main` branch

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository: https://github.com/Stepan3301/utyagifts
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Source**: `GitHub Actions` (not "Deploy from a branch")
4. Save the settings

### 2. Push the Configuration Files

The following files have been created/updated:
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `frontend/next.config.js` - Updated for static export

Push these changes:
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### 3. Wait for Deployment

1. Go to **Actions** tab in your GitHub repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Wait for it to complete (usually 2-3 minutes)
4. Once complete, your app will be available at:
   - `https://stepan3301.github.io/utyagifts/`

### 4. Update Your Telegram Bot Configuration

After deployment, update your bot's `WEBAPP_URL`:

1. Go to your Supabase/backend `.env` file
2. Update `WEBAPP_URL`:
   ```env
   WEBAPP_URL=https://stepan3301.github.io/utyagifts
   ```

3. Update your Telegram bot menu button to point to this URL

## Important Notes

### ⚠️ Telegram Mini App Requirements

1. **HTTPS Required**: GitHub Pages provides HTTPS automatically ✅
2. **Backend API**: Your backend still needs to be deployed separately (not on GitHub Pages)
   - Options: Railway, Render, Vercel, Heroku, etc.
   - Update `NEXT_PUBLIC_API_BASE_URL` in your frontend to point to your deployed backend

### 🔧 Configuration Details

The Next.js app is configured with:
- **Static Export**: `output: 'export'` - generates static HTML files
- **Base Path**: `/utyagifts` - matches your repository name
- **Unoptimized Images**: Required for static export

### 📝 Environment Variables for Production

For the deployed app, you may need to set environment variables in GitHub Actions:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add repository secrets if needed (though most should be public for frontend)

Or update `frontend/.env.production`:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com/api
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

## Troubleshooting

### App Still Shows README

1. **Check GitHub Actions**: Make sure the workflow completed successfully
2. **Check Pages Settings**: Ensure "Source" is set to "GitHub Actions"
3. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check URL**: Make sure you're visiting `https://stepan3301.github.io/utyagifts/` (with trailing slash)

### Build Fails

1. Check the **Actions** tab for error messages
2. Common issues:
   - Missing dependencies
   - TypeScript errors
   - Build configuration issues

### Assets Not Loading

- Check that `basePath` in `next.config.js` matches your repository name
- Ensure all asset paths are relative or use the `assetPrefix`

### Telegram WebApp Not Working

- Make sure `WEBAPP_URL` in your bot config points to the GitHub Pages URL
- Verify the URL is HTTPS (GitHub Pages provides this automatically)
- Check browser console for errors

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
cd frontend
npm run build
# The 'out' directory contains your static files
# Upload the contents of 'out' to a 'docs' folder in your repo
# Then configure GitHub Pages to serve from 'docs' folder
```

## Next Steps

1. ✅ Push the configuration files
2. ✅ Enable GitHub Pages with GitHub Actions source
3. ✅ Wait for deployment to complete
4. ✅ Update your Telegram bot's `WEBAPP_URL`
5. ✅ Test the app in Telegram

Your app will automatically redeploy whenever you push to the `main` branch!

