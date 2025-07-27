# Budget Tracker App

A personal budgeting app built with Next.js, Clerk authentication, and Supabase for secure, per-user data storage. Features include:

- User authentication with Clerk
- Per-user budgets, expenses, and income (Supabase RLS enforced)
- JWT-based access control
- Interactive charts and tables for financial visualization
- Modern, responsive UI

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env.local` with your Supabase and Clerk credentials (see below).
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Required .env.local variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Project Structure
- `src/app/` — Main app pages (budgets, expenses, income, goals, etc.)
- `src/components/` — UI components and context providers
- `src/utils/supabase/` — Supabase client and server utilities

## Security
- All user data is protected by Supabase Row Level Security (RLS) policies.
- Clerk JWTs are used for secure, per-user access.

Built with [Next.js](https://nextjs.org), [Clerk](https://clerk.com), and [Supabase](https://supabase.com).
