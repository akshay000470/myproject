export type AccountType = 'savings' | 'current' | 'cash' | 'credit_card' | 'other';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type CategoryType = 'income' | 'expense';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type GoalStatus = 'in_progress' | 'completed';
export type LoanType = 'borrowed' | 'lent';
export type LoanStatus = 'active' | 'paid_off' | 'defaulted';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  preferred_currency: string;
  date_format: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  destination_account_id?: string | null;
  category_id?: string | null;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  payment_method: string;
  description?: string | null;
  attachment_url?: string | null;
  created_at: string;
  updated_at: string;
  // Join properties
  account_name?: string;
  category_name?: string;
  destination_account_name?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month_year: string; // YYYY-MM
  created_at: string;
  updated_at: string;
  category?: Category;
  spent_amount?: number;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string | null;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: RecurringFrequency;
  start_date: string;
  next_due_date: string;
  is_active: boolean;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  description?: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  user_id: string;
  goal_id: string;
  account_id?: string | null;
  amount: number;
  date: string;
  notes?: string | null;
  created_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  type: LoanType;
  counterparty_name: string;
  total_amount: number;
  interest_rate: number;
  due_date?: string | null;
  paid_amount: number;
  status: LoanStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanRepayment {
  id: string;
  user_id: string;
  loan_id: string;
  account_id?: string | null;
  amount: number;
  date: string;
  notes?: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'budget_alert' | 'due_date';
  is_read: boolean;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  email_alerts: boolean;
  monthly_summary_email: boolean;
  created_at: string;
  updated_at: string;
}
