# Deploy DMP-TMS to Netlify

## Step 1: Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select **NdumisoRadebe/DurbanMetro**
5. Branch: **main**

## Step 2: Build Settings (Auto-filled)

Netlify will detect Next.js. Verify:

| Setting | Value |
|---------|-------|
| **Build command** | `prisma generate && next build` |
| **Publish directory** | (leave default - Netlify handles Next.js) |
| **Base directory** | (leave empty) |

## Step 3: Environment Variables

Before deploying, add these in **Site settings** → **Environment variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon **pooled** connection string (host must contain `-pooler`) |
| `NEXTAUTH_URL` | Your Netlify URL (e.g. `https://your-site-name.netlify.app`) |
| `NEXTAUTH_SECRET` | Random 32+ character string |

**Note:** After first deploy, update `NEXTAUTH_URL` to your actual Netlify URL.

**Neon:** Use the pooled connection string from Neon dashboard (Connection details → Pooled connection). Format: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

## Step 4: Deploy

1. Click **"Deploy site"**
2. Wait 3–5 minutes for the build
3. Your site will be live at `https://[random-name].netlify.app`

## Step 5: Custom Domain (Optional)

1. **Site settings** → **Domain management**
2. Add custom domain or change the auto-generated name

## Fix: "Base directory does not exist" / "Failed to parse configuration"

If the deploy fails with `Base directory does not exist: /opt/build/repo/C:\MetroPolice`:

1. Go to **Site settings** → **Build & deploy** → **Continuous Deployment** → **Build settings** → **Edit settings**
2. **Clear the Base directory** field (leave it empty)
3. **Clear the Publish directory** field (leave it empty)
4. Save and redeploy

The project root is the repo root—no base path is needed.

---

## Fix: PrismaClientInitializationError

If the site shows "This function has crashed" and logs show `PrismaClientInitializationError`:

1. **Set `DATABASE_URL`** in Netlify → Site settings → Environment variables (use Neon pooled connection string).
2. **Redeploy** after adding/updating env vars (Deploys → Trigger deploy).
3. **Run migrations** locally: `npx prisma db push` (uses same Neon DB).

---

## Share with Stakeholders

- **URL:** Your Netlify URL (e.g. `https://durban-metro-tms.netlify.app`)
- **Login:** `admin@ethekwini.gov.za` / `Admin@123`
