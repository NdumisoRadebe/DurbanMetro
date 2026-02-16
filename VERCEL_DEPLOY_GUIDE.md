# Step-by-Step: Deploy DMP-TMS to Vercel with Neon

Your project is showing **404** because the current deployment may be from an empty or different codebase. Follow these steps to deploy the full DMP-TMS app.

---

## Step 1: Get Your Neon Connection String

1. In your **Neon** dashboard: [console.neon.tech](https://console.neon.tech)
2. Select the **durbanmetropolice** project
3. Click **"Connect"** (or open the connection modal)
4. In the connection modal:
   - **Branch:** production
   - **Database:** neondb
   - Switch the dropdown from **"psql"** to **"Connection string"** (or **"Node.js"** / **"Prisma"**)
5. Copy the **full connection string**. It looks like:
   ```
   postgresql://neondb_owner:YOUR_PASSWORD@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
6. **Important:** For Vercel, use the **pooled** connection string if Neon offers it (often has `-pooler` in the host). This avoids connection limits on serverless.

---

## Step 2: Push Your Code to GitHub

1. Open **GitHub** and create a new repository (e.g. `durban-metro` or `MetroPolice`)
2. Open **Terminal** (or PowerShell) in your project folder:
   ```powershell
   cd c:\MetroPolice
   ```
3. Initialize Git and push (if not already done):
   ```powershell
   git init
   git add .
   git commit -m "DMP-TMS full application"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub details.

---

## Step 3: Connect the Repo to Vercel

1. Go to [vercel.com/ndumiso-radebes-projects/durban-metro](https://vercel.com/ndumiso-radebes-projects/durban-metro)
2. Click **"Settings"** in the top navigation
3. In the left sidebar, click **"Git"**
4. Click **"Connect Git Repository"** (or **"Disconnect"** first if something else is connected)
5. Choose **GitHub** and authorize Vercel if asked
6. Select your repository (the one you pushed in Step 2)
7. Choose the **main** branch
8. Click **"Connect"**

---

## Step 4: Add Environment Variables in Vercel

1. Still in **Settings**, click **"Environment Variables"** in the left sidebar
2. Add these variables (one by one):

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your Neon connection string from Step 1 | Production, Preview |
| `NEXTAUTH_URL` | `https://durban-metro.vercel.app` | Production |
| `NEXTAUTH_SECRET` | A random string (see below) | Production, Preview |

3. **Generate NEXTAUTH_SECRET:**
   - Option A: Run in terminal: `openssl rand -base64 32`
   - Option B: Use [generate-secret.vercel.app](https://generate-secret.vercel.app/32)
   - Option C: Use any long random string (e.g. 32+ characters)

4. Click **"Save"** after each variable.

---

## Step 5: Configure Build Settings (if needed)

1. In **Settings** → **"General"**
2. Check:
   - **Framework Preset:** Next.js
   - **Build Command:** `prisma generate && next build` (or leave default; our `package.json` has it)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

3. If your project is in a subfolder, set **Root Directory** to that folder. For `c:\MetroPolice` at repo root, leave it empty.

---

## Step 6: Trigger a New Deployment

1. Go to the **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment, or
3. Push a new commit to `main`:
   ```powershell
   git add .
   git commit -m "Deploy DMP-TMS"
   git push origin main
   ```
4. Wait for the build to finish (usually 2–5 minutes)
5. Click **"Visit"** or open `https://durban-metro.vercel.app`

---

## Step 7: Initialize the Database

After the first successful deployment:

1. Open **Terminal** in `c:\MetroPolice`
2. Create a `.env` file with your Neon `DATABASE_URL` (same as in Vercel)
3. Run:
   ```powershell
   npx prisma db push
   npm run db:seed
   ```

This creates the tables and seeds the default admin users.

---

## Step 8: Test the App

1. Go to `https://durban-metro.vercel.app`
2. You should see the **login page**
3. Log in with:
   - **Email:** `admin@ethekwini.gov.za`
   - **Password:** `Admin@123`

---

## Troubleshooting

### Still seeing 404?
- Confirm the correct repo and branch are connected in Vercel
- Check **Build Logs** for errors
- Ensure the build completes successfully

### Database connection errors?
- Use the **pooled** Neon connection string (host contains `-pooler`)
- Ensure `DATABASE_URL` is set for Production and Preview
- Redeploy after changing environment variables

### Build fails?
- Check **Build Logs** in Vercel
- Ensure `prisma generate` runs (it’s in the build script)
- Confirm Node.js version is 18.x in Vercel (Settings → General)
