# Fix 404 - Vercel Deploying Wrong Commit

## The Problem

Vercel is deploying **commit 11828b5** ("Create DMP") - which only has a 1-byte file. Your full app is in **commit 160858b**. That's why you get "No Next.js version detected" and 404.

**Redeploy uses the SAME commit** - so clicking "Redeploy" on an old deployment keeps using 11828b5.

---

## Fix: Deploy from Latest Commit

### Step 1: Create New Deployment (Not Redeploy)

1. Go to [vercel.com/ndumiso-radebes-projects/durban-metro](https://vercel.com/ndumiso-radebes-projects/durban-metro)
2. Click **"Deployments"** in the sidebar
3. Click **"Create Deployment"** or the **"Deploy"** button (top right)
4. Select **Branch: main**
5. Ensure it shows **latest commit: 160858b** (or newer)
6. Click **"Deploy"**

### Step 2: If "Create Deployment" Isn't Visible

1. Go to **Settings** → **Git**
2. Click **"Disconnect"** (temporarily)
3. Click **"Connect Git Repository"**
4. Select **GitHub** → **NdumisoRadebe/DurbanMetro**
5. **Production Branch:** `main`
6. Click **Connect**
7. This triggers a fresh deployment from the latest main

### Step 3: Verify Root Directory

1. **Settings** → **General**
2. **Root Directory:** Must be **EMPTY** (or `.`)
3. If it says "DMP" or anything else, **clear it**
4. Save

### Step 4: Trigger via Push

Run this to push a small change (forces new deployment):

```bash
cd C:\MetroPolice
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

This creates an empty commit and pushes - should trigger Vercel's webhook.

---

## After Fix

- Build should take **2-5 minutes**
- Deployment should show commit **160858b** or newer
- **https://durban-metro.vercel.app** should show the login page
