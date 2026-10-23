# PrepPilot — Full-Stack Placement Preparation Platform

PrepPilot is a production-ready, full-stack placement preparation web application built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**, backed by a cloud-hosted **Neon Serverless PostgreSQL** database.

Designed with PrepPilot's signature modern purple gradient identity, it delivers role-isolated Student and Admin portals, server-enforced authentication with HttpOnly cookies, deterministic daily aptitude testing, workbook-accurate DSA pattern visualizers, company recruitment tracking, and interview preparation resources.

---

## Architecture & Feature Highlights

### 1. Robust Role-Based Authentication & Isolation
- **Separate Student and Admin Portals**: Dedicated authentication flows and server-side middleware route guards (`/dashboard` vs `/admin`).
- **Student Registration**: Collects Full Name, Email, College Name, Branch, Academic Year, Password, and Password Confirmation with strict Zod validation.
- **Admin Security**: Public admin registration is strictly disabled. Admins log in via dedicated admin credentials. Initial admin account is provisioned securely via the seed script.
- **Security Tokens**: Secure sessions via HttpOnly `ppp_session` JWT cookies. Passwords hashed using `bcryptjs` (salt rounds: 10).
- **Password Reset**: Complete forgot-password and reset-password token flows.
- **Password Visibility Toggles**: Interactive show/hide toggles across all authentication forms.

### 2. Persistent Database (Neon Serverless PostgreSQL via Prisma ORM)
- **Neon Cloud PostgreSQL**: High-performance serverless PostgreSQL database with autoscaling and connection pooling.
- **Connection Pooling**: Uses `DATABASE_URL` with pooled connection (`...-pooler...neondb?sslmode=require`) for application queries.
- **Direct Connection for Migrations**: Uses `DATABASE_URL_UNPOOLED` for direct connections and schema migrations.
- **Pre-Seeded Real Data**:
  - 15 DSA Patterns & 189 LeetCode questions parsed directly from the official workbook.
  - Aptitude Question Bank with category tagging (Quantitative, Logical, Verbal, Data Interpretation) and difficulty rankings.
  - Curated Company Recruitment Drives & Eligibility Criteria (Google, Microsoft, Amazon, TCS).
  - Interview Preparation Videos, Notes, PDF Documents, and Community Experience Posts.
  - Pre-configured Student & Admin test accounts.

### 3. Workbook-Accurate DSA Patterns (15 Patterns & 189 Questions)
- 15 Curated Patterns: Two Pointers, Fast & Slow Pointers, Sliding Window, Kadane's Algorithm, Prefix Sum, Merge Intervals, In-Place Reversal of LinkedList, Stack, Hash Maps, Heap, Recursion & Backtracking, Tree Pattern, Dynamic Programming, Graphs, and Greedy.
- Dynamic Problem Status Tracking (Solved / Unsolved) persisted to Neon PostgreSQL.
- Interactive Step-by-Step Algorithm Visualizer with play/pause, step-forward, and variable inspector.
- Direct LeetCode problem links.

### 4. Daily Aptitude Quiz Engine
- **Deterministic 10-Question Daily Set**: Algorithmically seeds questions based on the calendar date (`YYYY-MM-DD`). Every student receives the exact same 10 questions on any given day.
- **Server-Side Scoring**: Question solutions are never leaked in client payloads until final submission.
- **Single Daily Attempt**: Enforced at database level via `DailyQuizAttempt`.
- **Explanations & Review**: Comprehensive step-by-step mathematical and logical explanations rendered post-submission.
- **Configuration Safeguard**: If fewer than 10 published questions exist, reports a configuration error instead of duplicating questions.

### 5. Admin Management Portal
- **Company Requirements**: Publish, edit, and moderate placement drives with CGPA, backlog, branch eligibility, and application deadlines.
- **Interview Hub**: Upload curated video links (YouTube/Vimeo), write preparation guides, and review student interview experience submissions.
- **Question Management**: Add, edit, and maintain aptitude question pools.
- **Student Analytics**: Track student progress, problem completion rates, and quiz metrics.
- **Audit Logs**: Record administrative actions.

---

## Seeded Test Accounts

The Neon PostgreSQL database is pre-seeded with the following credentials:

| Role | Email | Password | Portal Route | Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `student@college.edu` | `Student@12345` | `/login` &rarr; `/dashboard` | Solved DSA tracker, daily aptitude quizzes, company drives, interview videos, private notebook. |
| **Admin** | `admin@placement.edu` | `Admin@12345` | `/login?role=admin` or `/admin/login` &rarr; `/admin` | Full management access: company requirements, interview videos, aptitude questions, moderation queue, student analytics. |

*New students can also register anytime via `/register`.*

---

## Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm or yarn

### 1. Environment Configuration
Verify your `.env` file in the project root contains:
```env
DATABASE_URL="postgresql://<user>:<password>@<neon-pooler-host>/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://<user>:<password>@<neon-direct-host>/neondb?sslmode=require"
JWT_SECRET="preppilot-super-secure-production-jwt-secret-key-2025"
COOKIE_NAME="ppp_session"
NODE_ENV="development"
NEXT_PUBLIC_APP_NAME="PrepPilot"
```

> **Security Note**: `.env` is excluded from git via `.gitignore`. Secrets are never exposed to browser client code.

### 2. Database Sync & Seeding Commands (Windows PowerShell)
```powershell
# 1. Generate Prisma Client for PostgreSQL
npx prisma generate

# 2. Push schema to Neon PostgreSQL
npx prisma db push

# 3. Seed Neon database with workbook data, questions, companies, and admin
npx tsx prisma/seed.ts
```

### 3. Run Development Server
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Run Automated Test Suite
```powershell
npx vitest run
```
*Expected: 17 passed tests across 4 test suites.*

### 5. Production Build
```powershell
npx next build
```
*Expected: All 61 static and dynamic pages build cleanly with 0 errors.*

---

## Project Structure

```
placement_frontend/
├── data/                       # Workbook dataset and seed definitions
│   └── parsed_workbook.json
├── prisma/                     # Database schema and seed script
│   ├── schema.prisma           # PostgreSQL datasource with directUrl
│   └── seed.ts                 # Safe development seed script
├── src/
│   ├── app/                    # Next.js 14 App Router pages and APIs
│   │   ├── (auth)/             # Login, Register, Forgot/Reset Password
│   │   ├── admin/              # Role-protected Admin management pages
│   │   ├── api/                # REST endpoints backed by Neon PostgreSQL
│   │   ├── aptitude/           # Daily quiz and practice flows
│   │   ├── companies/          # Student company drives directory
│   │   ├── dashboard/          # Student personal analytics dashboard
│   │   ├── dsa/                # 15 DSA Patterns and problem visualizers
│   │   ├── interviews/         # Interview experiences and video resources
│   │   ├── notes/              # Private student notes editor
│   │   └── page.tsx            # PrepPilot Landing Page
│   ├── components/             # UI components & layouts
│   ├── lib/                    # Core utilities (auth, prisma, algorithms)
│   └── middleware.ts           # Route protection and role verification
└── tests/                      # Automated Vitest test suites
```
