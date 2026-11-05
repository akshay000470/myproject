-- ==============================================================================
-- ANTIGRAVITY PREMIUM FINTECH EXPENSE TRACKER - DATABASE SCHEMA & MIGRATIONS
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    preferred_currency TEXT DEFAULT 'INR',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Accounts Table (Savings, Current, Cash, Credit Card, Other)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('savings', 'current', 'cash', 'credit_card', 'other')),
    balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'INR',
    color TEXT DEFAULT '#174D3C',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Categories Table (Income & Expense categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT DEFAULT 'tag',
    color TEXT DEFAULT '#174D3C',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    destination_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'Net Banking',
    description TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    month_year TEXT NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_category_month UNIQUE (user_id, category_id, month_year)
);

-- 7. Recurring Transactions Table
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_due_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(14, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    target_date DATE,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Goal Contributions Table
CREATE TABLE IF NOT EXISTS public.goal_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Loans & Debts Table (Money borrowed or lent)
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('borrowed', 'lent')),
    counterparty_name TEXT NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount > 0),
    interest_rate NUMERIC(5, 2) DEFAULT 0.00,
    due_date DATE,
    paid_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid_off', 'defaulted')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Loan Repayments Table
CREATE TABLE IF NOT EXISTS public.loan_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'budget_alert', 'due_date')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light',
    email_alerts BOOLEAN DEFAULT TRUE,
    monthly_summary_email BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_recurring_user ON public.recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_user ON public.loans(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Helper to create standard user-isolation policy for a table
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'profiles', 'accounts', 'categories', 'transactions', 'budgets',
            'recurring_transactions', 'savings_goals', 'goal_contributions',
            'loans', 'loan_repayments', 'notifications', 'user_preferences'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "user_all_access_own_%s" ON public.%I', t, t);
        IF t = 'profiles' THEN
            EXECUTE format('CREATE POLICY "user_all_access_own_%s" ON public.%I FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id)', t, t);
        ELSE
            EXECUTE format('CREATE POLICY "user_all_access_own_%s" ON public.%I FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t, t);
        END IF;
    END LOOP;
END $$;

-- ==============================================================================
-- ATOMIC MONEY TRANSFER STORED PROCEDURE
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.perform_account_transfer(
    p_user_id UUID,
    p_from_account_id UUID,
    p_to_account_id UUID,
    p_amount NUMERIC(14, 2),
    p_title TEXT,
    p_date DATE,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_from_bal NUMERIC(14, 2);
    v_tx_id UUID;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Transfer amount must be greater than zero';
    END IF;

    IF p_from_account_id = p_to_account_id THEN
        RAISE EXCEPTION 'Source and destination accounts must be different';
    END IF;

    -- Lock and verify source account ownership and balance
    SELECT balance INTO v_from_bal
    FROM public.accounts
    WHERE id = p_from_account_id AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Source account not found or access denied';
    END IF;

    IF v_from_bal < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance in source account';
    END IF;

    -- Verify destination account ownership
    PERFORM 1
    FROM public.accounts
    WHERE id = p_to_account_id AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Destination account not found or access denied';
    END IF;

    -- Deduct from source account
    UPDATE public.accounts
    SET balance = balance - p_amount, updated_at = NOW()
    WHERE id = p_from_account_id;

    -- Credit to destination account
    UPDATE public.accounts
    SET balance = balance + p_amount, updated_at = NOW()
    WHERE id = p_to_account_id;

    -- Record transaction
    INSERT INTO public.transactions (
        user_id,
        account_id,
        destination_account_id,
        title,
        amount,
        type,
        date,
        payment_method,
        description
    ) VALUES (
        p_user_id,
        p_from_account_id,
        p_to_account_id,
        COALESCE(p_title, 'Account Transfer'),
        p_amount,
        'transfer',
        COALESCE(p_date, CURRENT_DATE),
        'Transfer',
        p_description
    )
    RETURNING id INTO v_tx_id;

    RETURN v_tx_id;
END;
$$;

-- ==============================================================================
-- AUTOMATIC NEW USER INITIALIZATION TRIGGER
-- (Creates Profile, User Preferences, and default category taxonomy)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Create Profile
    INSERT INTO public.profiles (id, email, full_name, preferred_currency, date_format)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'INR',
        'DD/MM/YYYY'
    );

    -- 2. Create Default Preferences
    INSERT INTO public.user_preferences (user_id, theme, email_alerts, monthly_summary_email)
    VALUES (NEW.id, 'light', TRUE, TRUE);

    -- 3. Seed Default Expense Categories
    INSERT INTO public.categories (user_id, name, type, icon, color, is_default)
    VALUES
        (NEW.id, 'Food & Dining', 'expense', 'utensils', '#174D3C', TRUE),
        (NEW.id, 'Transportation', 'expense', 'car', '#2D5A47', TRUE),
        (NEW.id, 'Shopping', 'expense', 'shopping-bag', '#B69B62', TRUE),
        (NEW.id, 'Entertainment', 'expense', 'film', '#5A6B5C', TRUE),
        (NEW.id, 'Education', 'expense', 'book-open', '#3A6351', TRUE),
        (NEW.id, 'Healthcare', 'expense', 'heart-pulse', '#C65C54', TRUE),
        (NEW.id, 'Housing & Rent', 'expense', 'home', '#174D3C', TRUE),
        (NEW.id, 'Utilities & Bills', 'expense', 'zap', '#8C7A4E', TRUE),
        (NEW.id, 'Subscriptions', 'expense', 'repeat', '#657766', TRUE),
        (NEW.id, 'Travel', 'expense', 'plane', '#2B4A3E', TRUE),
        (NEW.id, 'Other Expense', 'expense', 'tag', '#777B76', TRUE);

    -- 4. Seed Default Income Categories
    INSERT INTO public.categories (user_id, name, type, icon, color, is_default)
    VALUES
        (NEW.id, 'Salary', 'income', 'briefcase', '#174D3C', TRUE),
        (NEW.id, 'Freelance & Consulting', 'income', 'laptop', '#2D5A47', TRUE),
        (NEW.id, 'Business & Investments', 'income', 'trending-up', '#B69B62', TRUE),
        (NEW.id, 'Dividends & Interest', 'income', 'pie-chart', '#3A6351', TRUE),
        (NEW.id, 'Gifts & Grants', 'income', 'gift', '#5A6B5C', TRUE),
        (NEW.id, 'Other Income', 'income', 'plus-circle', '#777B76', TRUE);

    RETURN NEW;
END;
$$;

-- Trigger execution upon auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
