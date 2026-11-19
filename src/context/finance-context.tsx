"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  Account,
  Category,
  Transaction,
  Budget,
  RecurringTransaction,
  SavingsGoal,
  GoalStatus,
  Loan,
  LoanStatus,
  Profile,
  Notification,
  UserPreferences,
} from "@/types/database";
import { apiCall } from "@/lib/api-client";

interface DateRangeOption {
  label: string;
  value: "this_week" | "this_month" | "last_month" | "last_3_months" | "this_year" | "all";
}

interface FinanceContextType {
  // State
  user: { id: string; email: string; full_name?: string } | null;
  profile: Profile | null;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  goals: SavingsGoal[];
  loans: Loan[];
  notifications: Notification[];
  preferences: UserPreferences | null;
  isLoading: boolean;
  isConfigured: boolean;
  preferredCurrency: string;
  selectedRange: DateRangeOption["value"];

  // Actions
  setSelectedRange: (range: DateRangeOption["value"]) => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (fullName: string, preferredCurrency: string) => Promise<void>;

  // Accounts
  addAccount: (account: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => Promise<void>;

  // Transactions
  addTransaction: (tx: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Categories
  addCategory: (cat: Omit<Category, "id" | "user_id" | "created_at">) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Budgets
  setBudget: (categoryId: string, amount: number, monthYear: string) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Recurring
  addRecurring: (rec: Omit<RecurringTransaction, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>;
  toggleRecurring: (id: string) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
  processDueRecurring: () => Promise<number>;

  // Goals
  addGoal: (goal: Omit<SavingsGoal, "id" | "user_id" | "created_at" | "updated_at" | "current_amount" | "status">) => Promise<void>;
  contributeToGoal: (goalId: string, accountId: string, amount: number, notes?: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Loans
  addLoan: (loan: Omit<Loan, "id" | "user_id" | "created_at" | "updated_at" | "paid_amount" | "status">) => Promise<void>;
  recordLoanRepayment: (loanId: string, accountId: string | null, amount: number, notes?: string) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;

  // Computed Financials
  netBalance: number;
  filteredTransactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; full_name?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [notifications] = useState<Notification[]>([]);
  const [preferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRangeOption["value"]>("this_month");

  const loadUserData = (data: {
    accounts?: Account[];
    categories?: Category[];
    transactions?: Transaction[];
    budgets?: Budget[];
    recurring?: RecurringTransaction[];
    goals?: SavingsGoal[];
    loans?: Loan[];
  }) => {
    if (data.accounts) setAccounts(data.accounts);
    if (data.categories) setCategories(data.categories);
    if (data.transactions) setTransactions(data.transactions);
    if (data.budgets) setBudgets(data.budgets);
    if (data.recurring) setRecurring(data.recurring);
    if (data.goals) setGoals(data.goals);
    if (data.loans) setLoans(data.loans);
  };

  // Load Initial Session & Data
  useEffect(() => {
    setIsMounted(true);
    async function init() {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");
      if (token && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setProfile({
            id: parsed.id,
            email: parsed.email,
            full_name: parsed.full_name || null,
            avatar_url: parsed.avatar_url || null,
            preferred_currency: parsed.preferred_currency || "INR",
            date_format: parsed.date_format || "DD/MM/YYYY",
            created_at: parsed.created_at || new Date().toISOString(),
            updated_at: parsed.updated_at || new Date().toISOString(),
          });
          // Fetch fresh data from API
          const [accs, cats, txs, bdgs, recs, gls, lns] = await Promise.all([
            apiCall("/accounts"),
            apiCall("/categories"),
            apiCall("/transactions"),
            apiCall("/budgets"),
            apiCall("/recurring"),
            apiCall("/goals"),
            apiCall("/loans"),
          ]);
          loadUserData({ accounts: accs, categories: cats, transactions: txs, budgets: bdgs, recurring: recs, goals: gls, loans: lns });
        } catch {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth Functions
  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));
      setUser({ id: res.user.id, email: res.user.email, full_name: res.user.full_name });
      setProfile({
        id: res.user.id,
        email: res.user.email,
        full_name: res.user.full_name,
        avatar_url: res.user.avatar_url || null,
        preferred_currency: res.user.preferred_currency || "INR",
        date_format: res.user.date_format || "DD/MM/YYYY",
        created_at: res.user.created_at || new Date().toISOString(),
        updated_at: res.user.updated_at || new Date().toISOString(),
      });
      if (res.data) loadUserData(res.data);
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : "Login failed" };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const res = await apiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));
      setUser({ id: res.user.id, email: res.user.email, full_name: res.user.full_name });
      setProfile({
        id: res.user.id,
        email: res.user.email,
        full_name: res.user.full_name,
        avatar_url: null,
        preferred_currency: "INR",
        date_format: "DD/MM/YYYY",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setAccounts([]);
      setTransactions([]);
      setBudgets([]);
      setRecurring([]);
      setGoals([]);
      setLoans([]);
      // Fetch seeded categories
      const cats = await apiCall("/categories");
      setCategories(cats);
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : "Registration failed" };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    setProfile(null);
    setAccounts([]);
    setCategories([]);
    setTransactions([]);
    setBudgets([]);
    setRecurring([]);
    setGoals([]);
    setLoans([]);
  };

  const updateProfile = async (fullName: string, preferredCurrency: string) => {
    if (!user) return;
    const updated = await apiCall("/profile", {
      method: "PUT",
      body: JSON.stringify({ full_name: fullName, preferred_currency: preferredCurrency }),
    });
    setProfile(updated);
    // Also update auth_user in localStorage
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        localStorage.setItem("auth_user", JSON.stringify({ ...parsed, full_name: fullName, preferred_currency: preferredCurrency }));
      } catch { /* ignore */ }
    }
  };

  // ACCOUNTS CRUD
  const addAccount = async (accData: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return;
    const account = await apiCall("/accounts", {
      method: "POST",
      body: JSON.stringify(accData),
    });
    setAccounts((prev) => [...prev, account]);
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    if (!user) return;
    const account = await apiCall(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    setAccounts((prev) => prev.map((a) => (a.id === id ? account : a)));
  };

  const deleteAccount = async (id: string) => {
    if (!user) return;
    await apiCall(`/accounts/${id}`, { method: "DELETE" });
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const transferFunds = async (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => {
    if (!user || amount <= 0 || fromAccountId === toAccountId) return;
    const toAcc = accounts.find((a) => a.id === toAccountId);
    if (!toAcc) return;

    // Create a transfer transaction (deducts from source)
    await apiCall("/transactions", {
      method: "POST",
      body: JSON.stringify({
        account_id: fromAccountId,
        destination_account_id: toAccountId,
        title: `Transfer to ${toAcc.name}`,
        amount,
        type: "transfer",
        date: new Date().toISOString().split("T")[0],
        payment_method: "Transfer",
        description: notes || "Internal account transfer",
        category_id: null,
      }),
    });

    // Manually adjust destination account balance via update
    await apiCall(`/accounts/${toAccountId}`, {
      method: "PUT",
      body: JSON.stringify({ balance: (toAcc.balance + amount) }),
    });

    // Refresh accounts and transactions from server
    const [accs, txs] = await Promise.all([apiCall("/accounts"), apiCall("/transactions")]);
    setAccounts(accs);
    setTransactions(txs);
  };

  // TRANSACTIONS CRUD
  const addTransaction = async (txData: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return;
    const tx = await apiCall("/transactions", {
      method: "POST",
      body: JSON.stringify(txData),
    });
    setTransactions((prev) => [tx, ...prev]);
    // Refresh account balances
    const accs = await apiCall("/accounts");
    setAccounts(accs);
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    const tx = await apiCall(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    setTransactions((prev) => prev.map((t) => (t.id === id ? tx : t)));
    // Refresh account balances
    const accs = await apiCall("/accounts");
    setAccounts(accs);
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    await apiCall(`/transactions/${id}`, { method: "DELETE" });
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    // Refresh account balances
    const accs = await apiCall("/accounts");
    setAccounts(accs);
  };

  // CATEGORIES CRUD
  const addCategory = async (catData: Omit<Category, "id" | "user_id" | "created_at">) => {
    if (!user) return;
    const cat = await apiCall("/categories", {
      method: "POST",
      body: JSON.stringify(catData),
    });
    setCategories((prev) => [...prev, cat]);
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    await apiCall(`/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // BUDGETS
  const setBudget = async (categoryId: string, amount: number, monthYear: string) => {
    if (!user) return;
    const budget = await apiCall("/budgets", {
      method: "POST",
      body: JSON.stringify({ category_id: categoryId, amount, month_year: monthYear }),
    });
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.category_id === categoryId && b.month_year === monthYear);
      if (idx >= 0) return prev.map((b, i) => (i === idx ? budget : b));
      return [...prev, budget];
    });
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;
    await apiCall(`/budgets/${id}`, { method: "DELETE" });
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // RECURRING TRANSACTIONS
  const addRecurring = async (recData: Omit<RecurringTransaction, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return;
    const rec = await apiCall("/recurring", {
      method: "POST",
      body: JSON.stringify(recData),
    });
    setRecurring((prev) => [...prev, rec]);
  };

  const toggleRecurring = async (id: string) => {
    if (!user) return;
    const item = recurring.find((r) => r.id === id);
    if (!item) return;
    const rec = await apiCall(`/recurring/${id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    setRecurring((prev) => prev.map((r) => (r.id === id ? rec : r)));
  };

  const deleteRecurring = async (id: string) => {
    if (!user) return;
    await apiCall(`/recurring/${id}`, { method: "DELETE" });
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  };

  const processDueRecurring = async (): Promise<number> => {
    if (!user) return 0;
    const today = new Date().toISOString().split("T")[0];
    let processedCount = 0;

    for (const item of recurring) {
      if (item.is_active && item.next_due_date <= today) {
        // Create actual transaction
        await addTransaction({
          account_id: item.account_id,
          category_id: item.category_id,
          title: `[Recurring] ${item.title}`,
          amount: item.amount,
          type: item.type,
          date: today,
          payment_method: "Auto-Debit",
          description: `Auto-processed recurring payment (${item.frequency})`,
        });

        // Compute next due date
        const d = new Date(item.next_due_date);
        if (item.frequency === "daily") d.setDate(d.getDate() + 1);
        else if (item.frequency === "weekly") d.setDate(d.getDate() + 7);
        else if (item.frequency === "monthly") d.setMonth(d.getMonth() + 1);
        else if (item.frequency === "yearly") d.setFullYear(d.getFullYear() + 1);

        const nextDateStr = d.toISOString().split("T")[0];
        await apiCall(`/recurring/${item.id}`, {
          method: "PUT",
          body: JSON.stringify({ next_due_date: nextDateStr }),
        });
        setRecurring((prev) => prev.map((r) => (r.id === item.id ? { ...r, next_due_date: nextDateStr } : r)));
        processedCount++;
      }
    }
    return processedCount;
  };

  // SAVINGS GOALS
  const addGoal = async (goalData: Omit<SavingsGoal, "id" | "user_id" | "created_at" | "updated_at" | "current_amount" | "status">) => {
    if (!user) return;
    const goal = await apiCall("/goals", {
      method: "POST",
      body: JSON.stringify(goalData),
    });
    setGoals((prev) => [...prev, goal]);
  };

  const contributeToGoal = async (goalId: string, accountId: string, amount: number, notes?: string) => {
    if (!user || amount <= 0) return;
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    // Deduct from account as expense transaction
    await addTransaction({
      account_id: accountId,
      category_id: null,
      title: `Contribution to ${targetGoal.name}`,
      amount,
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      payment_method: "Savings Transfer",
      description: notes || `Transferred to savings goal: ${targetGoal.name}`,
    });

    const newAmount = targetGoal.current_amount + amount;
    const isCompleted = newAmount >= targetGoal.target_amount;
    const status: GoalStatus = isCompleted ? "completed" : "in_progress";

    const updated = await apiCall(`/goals/${goalId}`, {
      method: "PUT",
      body: JSON.stringify({ current_amount: newAmount, status }),
    });
    setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    await apiCall(`/goals/${id}`, { method: "DELETE" });
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // LOANS & DEBTS
  const addLoan = async (loanData: Omit<Loan, "id" | "user_id" | "created_at" | "updated_at" | "paid_amount" | "status">) => {
    if (!user) return;
    const loan = await apiCall("/loans", {
      method: "POST",
      body: JSON.stringify(loanData),
    });
    setLoans((prev) => [...prev, loan]);
  };

  const recordLoanRepayment = async (loanId: string, accountId: string | null, amount: number, notes?: string) => {
    if (!user || amount <= 0) return;
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    // If an account was chosen, create a transaction for it
    if (accountId) {
      await addTransaction({
        account_id: accountId,
        category_id: null,
        title: loan.type === "borrowed" ? `Repayment to ${loan.counterparty_name}` : `Repayment received from ${loan.counterparty_name}`,
        amount,
        type: loan.type === "borrowed" ? "expense" : "income",
        date: new Date().toISOString().split("T")[0],
        payment_method: "Repayment",
        description: notes || `Loan repayment for ${loan.counterparty_name}`,
      });
    }

    const newPaid = loan.paid_amount + amount;
    const status: LoanStatus = newPaid >= loan.total_amount ? "paid_off" : "active";

    const updated = await apiCall(`/loans/${loanId}`, {
      method: "PUT",
      body: JSON.stringify({ paid_amount: newPaid, status }),
    });
    setLoans((prev) => prev.map((l) => (l.id === loanId ? updated : l)));
  };

  const deleteLoan = async (id: string) => {
    if (!user) return;
    await apiCall(`/loans/${id}`, { method: "DELETE" });
    setLoans((prev) => prev.filter((l) => l.id !== id));
  };

  // COMPUTED FINANCIALS (Strictly based on real database records, NO hardcoded fake numbers)
  const netBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
  }, [accounts]);

  const filteredTransactions = useMemo(() => {
    if (!isMounted) return transactions;
    const now = new Date();
    return transactions.filter((tx) => {
      if (selectedRange === "all") return true;
      const txDate = new Date(tx.date);
      if (isNaN(txDate.getTime())) return true;

      if (selectedRange === "this_week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return txDate >= startOfWeek;
      }
      if (selectedRange === "this_month") {
        return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
      }
      if (selectedRange === "last_month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return txDate >= lastMonth && txDate < thisMonthStart;
      }
      if (selectedRange === "last_3_months") {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return txDate >= threeMonthsAgo;
      }
      if (selectedRange === "this_year") {
        return txDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, selectedRange, isMounted]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [filteredTransactions]);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;
  const preferredCurrency = profile?.preferred_currency || "INR";

  return (
    <FinanceContext.Provider
      value={{
        user,
        profile,
        accounts,
        categories,
        transactions,
        budgets,
        recurring,
        goals,
        loans,
        notifications,
        preferences,
        isLoading,
        isConfigured: true,
        preferredCurrency,
        selectedRange,
        setSelectedRange,
        signIn,
        signUp,
        signOut,
        updateProfile,
        addAccount,
        updateAccount,
        deleteAccount,
        transferFunds,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        deleteCategory,
        setBudget,
        deleteBudget,
        addRecurring,
        toggleRecurring,
        deleteRecurring,
        processDueRecurring,
        addGoal,
        contributeToGoal,
        deleteGoal,
        addLoan,
        recordLoanRepayment,
        deleteLoan,
        netBalance,
        filteredTransactions,
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
