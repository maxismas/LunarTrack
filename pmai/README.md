# PMai — Performance Management App
### Built for Lunar Rails

A full-stack web application for structured performance management meetings, quarterly evaluations, and AI-powered year-end reports.

---

## ⚡ Quick Start (5 minutes)

**Prerequisites:** Node.js 18+ → [nodejs.org](https://nodejs.org)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment file
cp .env.example .env

# 3. Create the database + tables
npm run db:push

# 4. Load demo users and sample data
npm run db:seed

# 5. Start the app
npm run dev
```

Then open **http://localhost:3000**

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Manager | sarah.manager@lunarrails.io | manager123 |
| Manager | james.manager@lunarrails.io | manager123 |
| Employee | alice@lunarrails.io | employee123 |
| Employee | bob@lunarrails.io | employee123 |
| Employee | carol@lunarrails.io | employee123 |
| Employee | david@lunarrails.io | employee123 |
| HR Admin | hr@lunarrails.io | hr123 |
| Super Admin | admin@lunarrails.io | admin123 |

---

## 🚀 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: PMai performance management app"
git branch -M main

# Create a new repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 📱 Features

### Manager Portal
- Team dashboard with meeting completion status, latest ratings, sign-off badges
- Monthly 1:1 form — 6 sections with optional Lunar Rails values tagging
- Quarterly review — 3 rated dimensions (1–5 scale), auto-calculated overall rating, development plan required at 4 or 5
- Employee profile with full meeting history

### Employee Portal
- View all meetings and ratings (read-only)
- Add self-reflection comments
- Sign off / acknowledge meetings
- Pending sign-offs highlighted as "Action Required"

### HR Dashboard
- Org-wide rating distribution across all teams
- Employee list with eligibility status

### Admin Panel
- Create and manage users, assign managers

---

## 🏆 Rating Scale

| Score | Label | Merit Eligible |
|-------|-------|----------------|
| 1 | Exceptional | ✅ Yes |
| 2 | Exceeds Expectations | ✅ Yes |
| 3 | Successful | ✅ Yes |
| 4 | Below Expectations | ❌ No |
| 5 | Unsatisfactory | ❌ No — PIP required |

---

## 🌐 Deploy to Vercel

1. Push to GitHub (see above)
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add Environment Variables:
   - `DATABASE_URL` — Postgres URL from [neon.tech](https://neon.tech) (free)
   - `NEXTAUTH_SECRET` — any 32+ character random string
   - `NEXTAUTH_URL` — your Vercel URL (e.g. `https://pmai.vercel.app`)
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
4. In `prisma/schema.prisma` change `provider = "sqlite"` to `provider = "postgresql"`
5. Deploy!

---

## 🗄️ Database Commands

```bash
npm run db:push     # Apply schema (creates/updates tables)
npm run db:seed     # Load demo data
npm run db:studio   # Open visual database browser
```

To reset and start fresh:
```bash
rm prisma/dev.db && npm run db:push && npm run db:seed
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database (local) | SQLite via Prisma ORM |
| Database (production) | PostgreSQL (Neon / Supabase / Vercel) |
| Auth | NextAuth.js v5 |
| AI (year-end reports) | Anthropic Claude API |
| Deployment | Vercel |

---

Built for Lunar Rails — April 2026
