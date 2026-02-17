# Fix "No Next.js version detected" on Vercel

**Root cause:** Vercel is deploying **commit 11828b5** ("Create DMP") instead of your latest code. That old commit doesn't have the full `package.json` with Next.js.

---

## Step 1: Push Latest Code (CRITICAL)

Your local `C:\MetroPolice` has the correct code. **You must push it to GitHub:**

### Option A: Using Cursor/VS Code Source Control
1. Open **Source Control** (Ctrl+Shift+G)
2. Stage all changes (click + next to "Changes")
3. Commit message: `Fix: Add Next.js for Vercel deployment`
4. Click **Sync Changes** or **Push**

### Option B: Using GitHub Desktop
1. Open GitHub Desktop
2. Select repository **DurbanMetro**
3. You should see uncommitted changes
4. Summary: `Fix: Add Next.js for Vercel deployment`
5. Click **Commit to main**
6. Click **Push origin**

### Option C: Using Terminal
```bash
cd C:\MetroPolice
git add .
git commit -m "Fix: Add Next.js for Vercel deployment"
git push origin main
```

---

## Step 2: Fix Vercel Root Directory

1. Go to [Vercel durban-metro Settings](https://vercel.com/ndumiso-radebes-projects/durban-metro/settings)
2. Click **General**
3. Find **Root Directory**
4. **Clear it completely** (leave empty) or set to `.`
5. Click **Save**

**Why:** If Root Directory is set to "DMP" or another folder, Vercel looks there for package.json. Your app is at the repo root.

---

## Step 3: Verify Deployment Uses New Commit

1. After pushing, go to [Vercel Deployments](https://vercel.com/ndumiso-radebes-projects/durban-metro/deployments)
2. A **new deployment** should start automatically
3. The new deployment should show a **different commit** (not 11828b5)
4. Build should take **2–5 minutes**
5. Status should be **Ready** (green)

---

## Step 4: If Push Fails - Check Git Remote

```bash
cd C:\MetroPolice
git remote -v
```

Should show:
```
origin  https://github.com/NdumisoRadebe/DurbanMetro.git
```

If it points elsewhere, fix it:
```bash
git remote set-url origin https://github.com/NdumisoRadebe/DurbanMetro.git
```

---

## What Was Changed

- Added `vercel-build` script to package.json (Vercel uses this when present)
- Removed custom buildCommand from vercel.json (let Vercel use package.json)
- Your package.json has `"next": "14.2.18"` in dependencies ✓
