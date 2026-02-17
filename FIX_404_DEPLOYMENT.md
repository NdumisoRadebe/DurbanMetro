# Fix 404 Error - Push Full Code to GitHub

Your Vercel deployment shows **"No framework detected"** and only deployed `/DMP` and `/README.md`. This means the GitHub repo `NdumisoRadebe/DurbanMetro` does **not** contain the full Next.js application.

**You need to push the full `c:\MetroPolice` folder contents to your GitHub repo.**

---

## Option A: Using GitHub Desktop (Easiest)

1. **Open GitHub Desktop** (install from [desktop.github.com](https://desktop.github.com) if needed)

2. **Add this folder as a repository:**
   - File → Add Local Repository
   - Browse to `C:\MetroPolice`
   - If it says "not a Git repository", click **"Create a repository"** and create it in `C:\MetroPolice`

3. **Connect to your GitHub repo:**
   - Repository → Repository Settings
   - Under "Primary remote repository", click **"Change"**
   - Enter: `https://github.com/NdumisoRadebe/DurbanMetro.git`
   - Save

4. **Push the full code:**
   - You should see all files (app, components, lib, prisma, package.json, etc.)
   - Summary: `Deploy full DMP-TMS to fix 404`
   - Click **"Commit to main"**
   - Click **"Push origin"**

5. **Vercel will auto-redeploy** (or go to Vercel → Deployments → Redeploy)

---

## Option B: Using Git in Terminal

1. **Open Git Bash** or **Command Prompt** (with Git in PATH)

2. **Navigate and push:**
   ```bash
   cd C:\MetroPolice
   git init
   git add .
   git commit -m "Deploy full DMP-TMS Next.js application"
   git branch -M main
   git remote add origin https://github.com/NdumisoRadebe/DurbanMetro.git
   git push -u origin main --force
   ```
   **Note:** `--force` overwrites the repo. Remove it if you want to merge instead.

---

## Option C: If Your Repo Has a Different Structure

If your GitHub repo has the app inside a folder (e.g. `DurbanMetro/DMP/`):

1. In **Vercel** → Project **Settings** → **General**
2. Set **Root Directory** to the folder containing `package.json` (e.g. `DMP` or `.`)
3. Save and redeploy

---

## After Pushing: Verify

1. Go to [github.com/NdumisoRadebe/DurbanMetro](https://github.com/NdumisoRadebe/DurbanMetro)
2. Confirm you see: `app/`, `components/`, `lib/`, `prisma/`, `package.json`, `next.config.js`
3. Vercel will auto-deploy (or trigger manually)
4. Build should take 2-5 minutes (not 14ms)
5. Visit `https://durban-metro.vercel.app` — you should see the login page

---

## Environment Variables (Reminder)

In Vercel → Settings → Environment Variables, ensure you have:

- `DATABASE_URL` — Your Neon connection string
- `NEXTAUTH_URL` — `https://durban-metro.vercel.app`
- `NEXTAUTH_SECRET` — Random 32+ character string
