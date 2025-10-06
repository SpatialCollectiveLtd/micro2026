Microtask 2026 — Next.js + Prisma + MySQL
=================================================

This is the foundation for the Microtask 2026 platform, built with Next.js (App Router), Tailwind CSS, and Prisma ORM connected to the live MySQL database.

Stack
- Next.js (App Router, JavaScript)
- Tailwind CSS
- Prisma ORM
- MySQL (live cPanel/Bluehost instance)

Getting started
1) Prerequisites
	- Node.js 18+ and npm
	- Access to the live MySQL instance

2) Install dependencies
	- npm install

3) Environment variables
	- Create a `.env` in the project root and set DATABASE_URL
	  Example:
	  DATABASE_URL="mysql://user:password@host:3306/database"

	Note: `.env*` is already ignored by git.

4) Prisma
	- Update `prisma/schema.prisma` as needed (initial models: User, Settlement)
	- Generate client:
	  npm run prisma:generate
	- Create/apply migrations (will connect to DATABASE_URL):
	  npx prisma migrate dev --name "initial-setup"

5) Run the dev server
	npm run dev

Project scripts
- dev: next dev
- build: next build
- start: next start
- lint: next lint
- prisma:generate: prisma generate

Notes
- Do not commit `.env` or secrets.
- If connecting to production DB from local dev, ensure your IP is allowed and the hostname/port are correct.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
