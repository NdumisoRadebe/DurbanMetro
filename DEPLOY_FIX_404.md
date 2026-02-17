# Fix 404 - Critical Vercel Configuration Steps

Your deployment shows **"No framework detected"** and only `/DMP` and `/README.md` because **Vercel is deploying an OLD commit (11828b5)** instead of your latest code. Follow these steps exactly.

---

## Step 1: Push These Changes (Triggers Fresh Deploy)

The project has been updated. **Commit and push** to trigger a new deployment:

```bash
cd C:\MetroPolice
git add .
git commit -m "Fix: Force Next.js framework detection for Vercel"
git push origin main
```

Or in **GitHub Desktop**: Commit all changes → Push origin

---

## Step 2: Verify Vercel Project Settings

Go to [Vercel durban-metro Settings](https://vercel.com/ndumiso-radebes-projects/durban-metro/settings)

### General Tab
| Setting | Must Be |
|---------|---------|
| **Root Directory** | Leave EMPTY (or `.`) – app is at repo root |
| **Framework Preset** | Next.js |
| **Build Command** | Leave default OR `next build` |
| **Output Directory** | Leave default (`.next`) |
| **Install Command** | `npm install` |
| **Node.js Version** | 18.x (not 24.x – can cause Prisma issues) |

### Git Tab
- **Production Branch**: `main`
- **Connected Repository**: `NdumisoRadebe/DurbanMetro`

---

## Step 3: Environment Variables

In **Settings → Environment Variables**, ensure:

| Variable | Value | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | Your Neon pooled connection string | Production, Preview |
| `NEXTAUTH_URL` | `https://durban-metro.vercel.app` | Production |
| `NEXTAUTH_SECRET` | Random 32+ char string | Production, Preview |

---

## Step 4: Redeploy After Push

1. After pushing, Vercel will **auto-deploy** (wait 2–5 min)
2. Or: **Deployments** → **Redeploy** → Select **"Use latest commit from main"**
3. Build should take **2–5 minutes** (not 14ms)
4. Deployment Summary should show **Next.js** (not "No framework detected")

---

## Step 5: If Still 404 – Disconnect & Reconnect Git

1. **Settings** → **Git** → **Disconnect** repository
2. **Connect** → Choose **GitHub** → Select `NdumisoRadebe/DurbanMetro`
3. Branch: `main`
4. This forces a fresh clone and deploy

---

## Changes Made to Your Project

- Added `"vercel": { "framework": "nextjs" }` to package.json for explicit detection
- Simplified build command to `next build` (prisma generate runs in postinstall)
- Added error handling to root page for missing env vars
- Bumped version to 1.0.1
