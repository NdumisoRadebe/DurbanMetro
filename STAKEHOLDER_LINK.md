# Get a Shareable Link for Stakeholders

Your app will be available at: **https://durban-metro.vercel.app**

---

## Option 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub:**
   - In Cursor: Source Control → Commit all → Push
   - Or: `git add . && git commit -m "Deploy for stakeholders" && git push origin main`

2. **Vercel will auto-deploy** (if your repo is connected)
   - Go to [vercel.com/ndumiso-radebes-projects/durban-metro](https://vercel.com/ndumiso-radebes-projects/durban-metro)
   - A new deployment will start automatically
   - Wait 2–3 minutes for the build to complete

3. **Share this link with stakeholders:**
   - **https://durban-metro.vercel.app**
   - Login: `admin@ethekwini.gov.za` / `Admin@123`

---

## Option 2: Deploy via Vercel CLI

1. **Log in to Vercel:**
   ```bash
   npx vercel login
   ```
   (Follow the browser prompt to authenticate)

2. **Deploy:**
   ```bash
   cd C:\MetroPolice
   npx vercel --prod
   ```

3. **You’ll get a URL** like `https://durban-metro-xxx.vercel.app` or your custom domain.

---

## Before Sharing – Checklist

- [ ] `DATABASE_URL` is set in Vercel (Neon connection string)
- [ ] `NEXTAUTH_URL` = `https://durban-metro.vercel.app`
- [ ] `NEXTAUTH_SECRET` is set (random 32+ character string)
- [ ] Database is seeded: run `npm run db:seed` locally (uses same Neon DB)
