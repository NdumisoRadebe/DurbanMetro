# DMP-TMS - Durban Metropolitan Police Time Management System

eThekwini Municipality - HR Time Management System for Durban Metropolitan Police.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js (Credentials + JWT)
- **Styling:** Tailwind CSS + Shadcn/ui
- **Deployment:** Vercel

## Features

- **Authentication:** Email/password login, RBAC (Super Admin, HR Admin, Viewer), account lockout after 5 failed attempts
- **Officer Management:** CRUD, search/filter, status indicators (On Duty/Off Duty/On Leave/Inactive)
- **Time & Attendance:** Clock-in/out, automatic hours calculation, overtime detection, bulk entry support
- **Leave Management:** Multiple leave types (ANL, SICK, AOL, FR, TRN, COMP, MAT, SUS), approval workflow, balance tracking, calendar view
- **Dashboard:** Real-time stats, currently on duty, pending approvals, AOL alerts
- **Reports:** Daily attendance, timesheet, leave register, overtime, AOL, station roster - CSV export
- **Audit:** Audit logging for compliance

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon, Supabase, or Railway recommended)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Configure `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dmp_tms"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

4. Push database schema and seed:

```bash
npx prisma db push
npm run db:seed
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default Login Credentials (after seed)

- **Super Admin:** admin@ethekwini.gov.za / Admin@123
- **HR Admin:** hr@ethekwini.gov.za / Admin@123

## Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_URL` - Your production URL (e.g. https://dmp-tms.vercel.app)
   - `NEXTAUTH_SECRET` - Secure random string
   - `CRON_SECRET` - For cron job authentication (optional)

3. Deploy - Vercel will run `prisma generate && next build` automatically

### Database Hosting Options

- **Neon** - Serverless PostgreSQL, free tier
- **Supabase** - PostgreSQL + Auth + Storage
- **Railway** - Simple PostgreSQL hosting

## Project Structure

```
app/
├── (auth)/login/          # Login page
├── (dashboard)/          # Protected dashboard routes
│   ├── dashboard/        # Dashboard home, officers, attendance, leave, reports, settings
│   └── layout.tsx        # Dashboard layout with sidebar
├── api/                  # API routes
│   ├── auth/             # NextAuth
│   ├── officers/         # Officer CRUD
│   ├── attendance/       # Clock-in/out, on-duty
│   ├── leaves/           # Leave management
│   ├── reports/          # Report generation
│   └── cron/             # Scheduled jobs
components/
lib/                      # Prisma, auth, utils
prisma/                   # Schema, seed
```

## License

Proprietary - eThekwini Municipality
