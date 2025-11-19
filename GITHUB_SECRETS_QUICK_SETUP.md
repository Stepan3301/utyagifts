# Quick Setup: GitHub Secrets for Backend API

## Problem
Your app is trying to connect to `localhost:4000` which doesn't work in production. You need to set your Railway backend URL as a GitHub Secret.

## Step 1: Get Your Railway Backend URL

1. Go to your Railway project: https://railway.app
2. Click on **@rocket-gifts/backend** service
3. Go to **Settings** tab → **Networking** section
4. Under **Public Networking**, find your domain (e.g., `rocket-giftsbackend-production.up.railway.app`)
5. Copy the domain and add `https://` prefix and `/api` suffix
6. **Important**: Do NOT include the port number (Railway handles that automatically)

**Example from your Railway:**
- Railway shows: `rocket-giftsbackend-production.up.railway.app` (Port 8080)
- Use as secret: `https://rocket-giftsbackend-production.up.railway.app/api`
- ✅ Correct format: `https://[domain].up.railway.app/api`
- ❌ Wrong format: `https://[domain].up.railway.app:8080/api` (don't include port)

## Step 2: Add GitHub Secret

1. Go to your GitHub repository: https://github.com/Stepan3301/utyagifts
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NEXT_PUBLIC_API_BASE_URL`
5. Value: Paste your Railway backend URL with `/api` (from Step 1)
6. Click **Add secret**

## Step 3: Redeploy

After adding the secret:

1. Go to **Actions** tab in your GitHub repo
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow** (or just push a new commit)
4. Wait for the build to complete

## Step 4: Verify

1. Open your deployed app: https://stepan3301.github.io/utyagifts
2. Open browser console (F12)
3. Try to use the app - you should see API calls going to your Railway backend
4. Check that user registration works (no more `ERR_CONNECTION_REFUSED` errors)

## Troubleshooting

### Still seeing localhost errors?
- Make sure the secret name is exactly: `NEXT_PUBLIC_API_BASE_URL` (case-sensitive)
- Make sure you added `/api` at the end of the Railway URL
- Make sure you redeployed after adding the secret

### Backend not responding?
- Check Railway logs to see if backend is running
- Verify your Railway backend URL is correct
- Make sure CORS is enabled on your backend (should be already configured)

### Can't find Railway URL?
- Railway might not have generated a public domain yet
- Go to Railway → Backend Service → Settings → Networking
- Click **Generate Domain** if no domain exists

