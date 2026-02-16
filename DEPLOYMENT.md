# Deploy DMP-TMS to Vercel

Deploy to your project: [durban-metro on Vercel](https://vercel.com/ndumiso-radebes-projects/durban-metro)

## Option 1: Deploy via Git (Recommended)

1. **Initialize Git and push to GitHub** (if not already done):
   ```bash
   cd c:\MetroPolice
   git init
   git add .
   git commit -m "Initial DMP-TMS deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/durban-metro.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/ndumiso-radebes-projects/durban-metro)
   - If the repo isn't connected: **Settings** → **Git** → Connect your GitHub repository
   - Or **Import** a new project and select your `durban-metro` / `MetroPolice` repo

3. **Set Environment Variables** (Settings → Environment Variables):
   | Variable | Value | Required |
   |----------|-------|----------|
   | `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Required |
   | `NEXTAUTH_URL` | `https://durban-metro.vercel.app` (your Vercel URL) | Required |
   | `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Required |
   | `CRON_SECRET` | Generate with `openssl rand -base64 32` | Optional |

4. **Redeploy** – Vercel will auto-deploy on push, or deploy manually from the dashboard.

---

## Option 2: Deploy via Vercel CLI

1. **Install Node.js** (if needed): https://nodejs.org/

2. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

3. **Deploy**:
   ```bash
   cd c:\MetroPolice
   vercel
   ```
   - Follow prompts to log in and link to project `durban-metro`
   - For production: `vercel --prod`

4. **Add environment variables** in the Vercel dashboard (see table above).

---

## Database Setup

1. Create a PostgreSQL database (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))  
2. Copy the connection string into `DATABASE_URL`  
3. Run migrations after first deploy:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
   Or use Neon/Supabase SQL editor to run the schema if needed.

---

## Post-Deploy Checklist

- [ ] Set `NEXTAUTH_URL` to your deployment URL (e.g. `https://durban-metro-xxx.vercel.app`)
- [ ] Set `DATABASE_URL` to your PostgreSQL connection string
- [ ] Set `NEXTAUTH_SECRET` to a secure random string
- [ ] Run `prisma db push` and `npm run db:seed` to initialize the database
- [ ] Test login: `admin@ethekwini.gov.za` / `Admin@123`
