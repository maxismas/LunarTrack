# Complete Setup Guide - Lunar Rails Performance Management

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

The `.env` file is already configured with sensible defaults. The main variable to note:
- `DATABASE_URL="file:./dev.db"` - Uses local SQLite
- `NEXTAUTH_SECRET` - Set to a random string (minimum 32 chars)
- `NEXTAUTH_URL="http://localhost:3000"` - Local dev URL

### 3. Initialize Database
```bash
# Generate Prisma client
npm run db:generate

# Create database schema
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 5. Login with Demo Account
Use any of these credentials:
- **Manager**: sarah.manager@lunarrails.io / manager123
- **Employee**: alice@lunarrails.io / employee123
- **HR Admin**: hr@lunarrails.io / hr123
- **Admin**: admin@lunarrails.io / admin123

## Detailed Setup Instructions

### System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (or yarn/pnpm)
- **Git**: For version control
- **Modern Browser**: Chrome, Safari, Firefox, or Edge

### Installation Steps

#### Step 1: Clone/Navigate to Project

```bash
cd "/path/to/mnt/AI Project - PMai/pmai"
```

#### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Next.js 14 with App Router
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Prisma ORM
- NextAuth.js
- React Hook Form
- Zod validation
- Anthropic SDK (for future AI features)

Expected output shows all packages installed successfully.

#### Step 3: Configure Environment

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env` if needed. Default values:

```
# Database (SQLite for development)
DATABASE_URL="file:./dev.db"

# NextAuth configuration
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Anthropic (optional, for future features)
ANTHROPIC_API_KEY="sk-ant-..."
```

**IMPORTANT for Production**:
- Generate a new `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- Change `NEXTAUTH_URL` to your production domain
- Switch to PostgreSQL for `DATABASE_URL`

#### Step 4: Setup Database

**Generate Prisma Client:**
```bash
npm run db:generate
```

This creates the Prisma client based on the schema.

**Create Database:**
```bash
npm run db:push
```

This:
1. Creates SQLite database at `dev.db`
2. Creates all tables
3. Establishes relationships

**Seed Demo Data:**
```bash
npm run db:seed
```

This creates:
- 1 Super Admin user
- 2 Managers
- 1 HR Admin
- 4 Employees
- Sample meetings and reviews

#### Step 5: Start Development Server

```bash
npm run dev
```

Output should show:
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

#### Step 6: Access the Application

Open `http://localhost:3000` in your browser. You'll be redirected to login.

## First Login & Exploration

### As a Manager

1. Login with `sarah.manager@lunarrails.io` / `manager123`
2. See dashboard with your team (2 employees)
3. Click "View History" to see sample meetings
4. Create a new monthly meeting for an employee
5. Create a quarterly review

### As an Employee

1. Login with `alice@lunarrails.io` / `employee123`
2. See your meetings list with pending sign-offs
3. Click on a meeting to view manager's notes
4. Add your reflection on the feedback
5. Sign off on the meeting

### As HR Admin

1. Login with `hr@lunarrails.io` / `hr123`
2. View rating distribution chart
3. See all employees and their managers
4. Prepare for calibration conversations

### As Super Admin

1. Login with `admin@lunarrails.io` / admin123
2. Access user management
3. Create new users
4. Assign roles and managers

## Common Tasks

### View Database Contents

```bash
npm run db:studio
```

Opens Prisma Studio in browser at `http://localhost:5555`. You can:
- View all records
- Edit data
- Create/delete records
- Inspect relationships

### Reset Database

```bash
# Delete database file
rm dev.db

# Recreate schema
npm run db:push

# Reseed demo data
npm run db:seed
```

### View Application Logs

The terminal running `npm run dev` shows:
- Request logs
- Build errors
- Warnings
- Console output from pages

### Debug TypeScript Issues

```bash
# Check for TypeScript errors
npx tsc --noEmit
```

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Troubleshooting

### "Cannot find module 'next'" error

```bash
npm install
rm -rf node_modules package-lock.json
npm install
```

### Database locked error

SQLite is locked when multiple processes access it:

```bash
# Kill the dev server (Ctrl+C)
# Delete lock file
rm dev.db-journal
# Restart
npm run dev
```

### Port 3000 already in use

```bash
# Use different port
npm run dev -- -p 3001
```

Then open `http://localhost:3001`

### Prisma client not generated

```bash
npm run db:generate
npm run dev
```

### Password hash errors during seed

Ensure `bcryptjs` is installed:

```bash
npm install bcryptjs
npm run db:seed
```

### Clear node_modules and reinstall

```bash
rm -rf node_modules package-lock.json
npm install
npm run db:generate
npm run dev
```

## Development Tips

### Hot Reload

The app auto-reloads when you edit files. Changes to:
- Pages: Reload immediately
- Components: Reload immediately
- Styles: Reload immediately
- API routes: Restart server (a few seconds)

### Database Schema Changes

To modify the database schema:

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Run `npm run db:generate` to update client
4. Restart dev server

### Adding New API Routes

Create new files in `app/api/[endpoint]/route.ts`:

```typescript
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Your logic here
  return NextResponse.json({ data: [] })
}
```

### Adding New Pages

Create new files in `app/(dashboard)/[section]/page.tsx`:

```typescript
'use client'

import { PageHeader } from '@/components/page-header'

export default function NewPage() {
  return (
    <div>
      <PageHeader
        title="Page Title"
        description="Description here"
      />

      {/* Your content */}
    </div>
  )
}
```

### Using UI Components

Import shadcn/ui components:

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
```

## File Structure Overview

```
pmai/
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Auth section (login, etc)
│   ├── (dashboard)/              # Dashboard section (protected)
│   ├── api/                      # API routes
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── *.tsx                     # Custom components
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── db.ts                     # Prisma singleton
│   ├── utils.ts                  # Utility functions
│   └── constants.ts              # App constants
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed script
├── types/
│   └── index.ts                  # TypeScript types
├── middleware.ts                 # Route protection
└── Config files (tsconfig, tailwind, etc)
```

## Architecture Notes

### Authentication Flow

1. User enters credentials on login page
2. NextAuth.js uses Credentials provider
3. Password validated against bcrypt hash
4. JWT token created with user data
5. Middleware protects routes
6. Session available in `useSession()` hook

### Data Flow

1. Pages use `fetch()` to call API routes
2. API routes check auth via `auth()`
3. Database queries via Prisma client
4. Response returned as JSON
5. Pages update state and re-render

### Role-Based Access

- Routes protected by middleware
- API endpoints check `session.user.role`
- Components conditionally render based on role
- Users redirected to appropriate dashboard

## Next Steps

1. **Explore the codebase**: Review components and pages
2. **Customize branding**: Update colors in tailwind.config.ts
3. **Modify values**: Update LUNAR_RAILS_VALUES in lib/constants.ts
4. **Add features**: Create new pages, components, API routes
5. **Deploy**: Follow production deployment guidelines

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run linter

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Sync schema with database
npm run db:seed          # Seed demo data
npm run db:studio        # Open Prisma Studio

# Cleanup
rm dev.db                # Delete database
rm -rf .next             # Delete build cache
rm -rf node_modules      # Delete dependencies
```

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **NextAuth.js**: https://next-auth.js.org
- **TypeScript**: https://www.typescriptlang.org/docs

## Production Checklist

Before deploying to production:

- [ ] Change `NEXTAUTH_SECRET` to a secure value
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Switch to PostgreSQL database
- [ ] Set `NODE_ENV=production`
- [ ] Configure environment variables
- [ ] Test all auth flows
- [ ] Test all API endpoints
- [ ] Enable HTTPS
- [ ] Setup database backups
- [ ] Configure error monitoring (Sentry, etc)
- [ ] Setup logging
- [ ] Test email notifications (when added)

## Questions?

Refer to:
1. Code comments in source files
2. Component TypeScript types
3. README.md for feature overview
4. This file for setup help
