# Deploy to Netlify Without GitHub

Use this guide when GitHub deployment is failing. You can deploy directly from your computer using the Netlify CLI.

---

## Option 1: Deploy from This Project (Recommended)

1. **Open PowerShell** in the project folder (`c:\MetroPolice`).

2. **Run the deploy script:**
   ```powershell
   .\scripts\deploy-netlify.ps1
   ```

3. **First-time setup** (Netlify will prompt you):
   - Log in via browser when asked (`npx netlify login` if needed)
   - Run `npx netlify link` to link to your site (or create one at [app.netlify.com](https://app.netlify.com) first)
   - Choose **"Link to an existing site"** or **"Create & configure a new site"**

4. **Set environment variables** in Netlify:
   - Go to [app.netlify.com](https://app.netlify.com) → Your site → **Site settings** → **Environment variables**
   - Add:
     - `DATABASE_URL` = Neon PostgreSQL connection string
     - `NEXTAUTH_URL` = Your Netlify URL (e.g. `https://your-site.netlify.app`)
     - `NEXTAUTH_SECRET` = Random 32+ character string

5. **Redeploy** after setting env vars:
   ```powershell
   npx netlify deploy --prod
   ```

---

## Option 2: Create a Zip and Deploy Elsewhere

Use this if you need to deploy from another computer or share the project.

1. **Create the deploy package:**
   ```powershell
   .\scripts\prepare-deploy-package.ps1
   ```
   This creates `dmp-tms-deploy.zip` in the project folder.

2. **Extract the zip** to a new empty folder (e.g. `C:\DeployDMP`). Ensure `app/`, `types/`, and `package.json` are at the root—no nested `netlify-deploy-package` folder.

3. **Open terminal** in that folder and run:
   ```powershell
   npm install
   npm config set fetch-timeout 120000
   npm config set fetch-retries 5
   npx netlify login
   npx netlify link
   npx netlify deploy --prod
   ```

4. **Set environment variables** in the Netlify dashboard (same as Option 1).

---

## Fix: MissingBlobsEnvironmentError ("Uploading blobs" failed)

If you get `MissingBlobsEnvironmentError` or "The environment has not been configured to use Netlify Blobs":

1. **Link the site** before deploying:
   ```powershell
   npx netlify link
   ```
   Choose "Link to an existing site" and select your site (or create one first at [app.netlify.com](https://app.netlify.com)).

2. **Clear Publish directory** in Netlify:
   - Site settings → Build & deploy → Build settings → Edit settings
   - Clear **Publish directory** (leave blank)
   - Save

3. **Deploy again:**
   ```powershell
   npx netlify deploy --prod
   ```

**Alternative:** Use **Git deploy** instead—the build runs on Netlify's servers where Blobs works. Connect your repo at [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git.

---

## Fix: Publish Directory (Required for Next.js)

In Netlify → **Site settings** → **Build & deploy** → **Build settings** → **Edit settings** → **clear the Publish directory** (leave blank). The Next.js plugin handles output. Save and redeploy.

---

## Fix: ETIMEDOUT / Network Error

If you get `npm error ETIMEDOUT` or "Error while installing dependencies in .netlify/plugins":

1. **Remove Publish directory override** in Netlify:
   - [app.netlify.com](https://app.netlify.com) → Your site → **Site settings** → **Build & deploy** → **Build settings** → **Edit settings**
   - Clear **Publish directory** (leave blank – Next.js plugin handles it)
   - Save

2. **Regenerate the deploy package** and try again:
   ```powershell
   cd c:\MetroPolice
   .\scripts\prepare-deploy-package.ps1
   ```
   Extract the new zip, run `npm install`, then `npx netlify deploy --prod`

3. **Try a different network** (e.g. mobile hotspot) – the timeout may be due to firewall/proxy.

4. **Use GitHub deploy instead** – the build runs on Netlify's servers, so your network is not used. Connect your repo at [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git.

---

## Checklist Before Deploy

- [ ] `DATABASE_URL` is set in Netlify (Neon connection string)
- [ ] `NEXTAUTH_SECRET` is set (random 32+ chars)
- [ ] After first deploy: set `NEXTAUTH_URL` to your Netlify URL
- [ ] Database is seeded: run `npm run db:seed` locally (uses same Neon DB)

---

## Default Login

- **Email:** `admin@ethekwini.gov.za`
- **Password:** `Admin@123`
