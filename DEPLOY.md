# Season Tickets - Deployment Guide

## Quick Deploy to Render.com

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   # Create a new repository on GitHub first, then:
   git remote add origin https://github.com/YOUR-USERNAME/season-tickets.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to https://render.com
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"
   - Select your `season-tickets` repository
   - Render will auto-detect the `render.yaml` configuration
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment

3. **Get Your URL:**
   - Render will provide a URL like: `https://season-tickets-xxxx.onrender.com`
   - Your endpoint will be: `https://season-tickets-xxxx.onrender.com/code`

### Option 2: Deploy without GitHub

1. **Create a ZIP file:**
   ```bash
   cd "/Users/akshitkapoor/Documents/faltu questions"
   zip -r season-tickets.zip season-tickets -x "*/node_modules/*" "*.log" "*/.git/*"
   ```

2. **Manual Deploy:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Choose "Deploy from Git" or upload ZIP
   - Follow the prompts

## Testing Your Deployment

Once deployed, test with:
```bash
curl https://YOUR-RENDER-URL/code
curl https://YOUR-RENDER-URL/code/code
```

Both should return HTTP 200 and the HTML dashboard.

## Submit to Grading System

Submit this URL:
```
https://YOUR-RENDER-URL/code
```

Replace `YOUR-RENDER-URL` with your actual Render URL.
