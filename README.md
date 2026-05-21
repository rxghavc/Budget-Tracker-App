# Budgetly

Budgetly is a personal finance dashboard built with Next.js, TypeScript, Clerk, and Supabase. It helps users track budgets, income, expenses, and savings goals in one place with a clean, responsive interface and per-user data isolation.

## Key Features

- Dashboard overview with income, expense, and trend summaries
- Budget management with category-based allocation charts and edit/add/delete flows
- Expense tracking with notes, categories, future-date toggles, and time-based charts
- Income tracking with summary cards, charts, and CSV export
- Goal tracking with progress updates, filtering, and CRUD actions
- Currency selection that updates the app display across views
- Supabase-backed data storage with row-level security for per-user records
- Responsive UI with reusable charts, tables, dialogs, popovers, and sidebar navigation
- Feedback flow from the settings page for quick user contact

## Tech Stack

- Frontend: Next.js, React, TypeScript
- Styling: Tailwind CSS, shadcn/ui, Radix UI
- Auth: Clerk
- Backend/Data: Supabase
- Charts and tables: Recharts, TanStack Table

## Screenshots

<img width="1918" height="681" alt="image" src="https://github.com/user-attachments/assets/2fecb546-cdb3-458a-b6c4-75ebd6b7e37b" />
<img width="1918" height="958" alt="image" src="https://github.com/user-attachments/assets/1b46e4b1-1354-472a-b015-ae533416ae2b" />
<img width="1918" height="960" alt="image" src="https://github.com/user-attachments/assets/360f3a84-b8b3-4e15-96c6-a3e2c547bcad" />
<img width="1919" height="957" alt="image" src="https://github.com/user-attachments/assets/a783f610-e8cf-4b05-af91-3efa517dd5d0" />

## Prerequisites

Before you start, make sure you have:

- Node.js
- A Clerk application
- A Supabase project
- Your Clerk and Supabase credentials ready for local environment setup

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/rxghavc/Budget-Tracker-App.git
   cd Budget-Tracker-App
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root and add the required environment variables listed below.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env` file in the root of the project with the following values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Security

- Supabase Row Level Security is used to isolate user data.
- Clerk JWTs are used to authorize access to user-specific records.

Built with [Next.js](https://nextjs.org), [Clerk](https://clerk.com), and [Supabase](https://supabase.com).
