Microtask 2026 — Next.js + Prisma + MySQL
=================================================

Foundation for the Microtask 2026 platform, built with Next.js (App Router), Tailwind CSS, and Prisma ORM on MySQL.

Stack
- Next.js (App Router)
- Tailwind CSS
- Prisma ORM
- MySQL

Environment Variables
- DATABASE_URL: Full MySQL connection string.
  - Example: mysql://user:password@host:3306/database
- SESSION_SECRET: Strong random secret for iron-session.
- CRON_SECRET: Secret for authorizing the daily jobs endpoint (x-cron-secret header).
- PAY_PER_TASK: Base pay per task (number). Example: 0.1
- ADMIN_PHONE (optional, seed): Admin phone created by seed script.
- WORKER1_PHONE, WORKER2_PHONE (optional, seed): Worker phones created by seed.

Getting Started
1) Prerequisites
   - Node.js 18+ and npm
   - A MySQL database (ensure your IP is allowed if remote)

2) Install dependencies
   - npm install

3) Create `.env` with variables above

4) Prisma
   - Generate client: npm run prisma:generate
   - Create/apply migrations: npx prisma migrate dev --name init
   - Seed sample data: npm run db:seed

5) Dev server
   - npm run dev
   - Visit http://localhost:3000

Project scripts
- dev/build/start/lint
- prisma:generate
- prisma:migrate (dev)
- db:test (connectivity)
- db:seed
- cron:start (local cron runner)

Notes
- Do not commit `.env` or secrets.
- For production, mt_session cookie is Secure + HttpOnly + SameSite=Lax.

Deployment
- Vercel: Use Vercel Cron Jobs to invoke `POST /api/admin/cron/run-daily-jobs` on your desired schedule. Add a header `x-cron-secret: $CRON_SECRET`.
- External: You can also trigger the endpoint from GitHub Actions or any scheduler that can send an HTTP POST with the same header.
- Environment: Ensure `CRON_SECRET` is set in the hosting environment variables. The endpoint also allows ADMIN cookie fallback for manual runs, but header is preferred.
