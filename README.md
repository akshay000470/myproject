# Antigravity Financial Suite

A production-ready, full-stack personal wealth, budgeting, and expense tracking platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL with Row Level Security)**.

---

## Architecture & Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS (Custom Fintech Palette: Warm Ivory `#F8F7F2`, Forest Green `#174D3C`, Sage `#DCE8DE`, Muted Gold `#B69B62`, Expense Red `#C65C54`)
- **Data Visualization**: Recharts
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) & Supabase SSR
- **Icons**: Lucide React

---

## Features

- **Dashboard**: Net balance, income, expenses, period savings rate, income vs. expense cashflow charts, and category breakdown.
- **Transactions**: Full CRUD, inter-account transfers, search, multi-filters, sorting, pagination, and CSV export.
- **Accounts**: Multi-account management (Savings, Current, Cash, Credit Card) with atomic fund transfers.
- **Budgets**: Monthly category spending ceilings with real-time utilization progress and overspending alerts.
- **Categories**: Income & expense classification taxonomy with custom colors and system defaults.
- **Recurring Commitments**: Automated tracking with daily/weekly/monthly/yearly frequencies and due-date execution.
- **Savings Goals**: Milestone capital accumulation with account-linked deposits.
- **Debts & Loans**: Liabilities (Borrowed) vs. Receivables (Lent) with repayment logs and interest tracking.
- **Reports & Analytics**: Annual statement generation, month-over-month comparisons, and CSV reports.
- **Settings**: Currency selection (INR ₹ default, USD, EUR, GBP, AED, SGD), date format, and full JSON vault export.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migrations
Copy the SQL migration from `supabase/migrations/20261105_init_schema.sql` and run it in your **Supabase SQL Editor**.

### 4. Start Local Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
