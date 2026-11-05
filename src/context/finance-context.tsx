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
  GoalContribution,
  Loan,
  LoanStatus,
  LoanRepayment,
  Profile,
  Notification,
  UserPreferences,
} from "@/types/database";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

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

const DEFAULT_CATEGORIES: Omit<Category, "id" | "user_id" | "created_at">[] = [
  { name: "Food & Dining", type: "expense", icon: "utensils", color: "#174D3C", is_default: true },
  { name: "Transportation", type: "expense", icon: "car", color: "#2D5A47", is_default: true },
  { name: "Shopping", type: "expense", icon: "shopping-bag", color: "#B69B62", is_default: true },
  { name: "Entertainment", type: "expense", icon: "film", color: "#5A6B5C", is_default: true },
  { name: "Education", type: "expense", icon: "book-open", color: "#3A6351", is_default: true },
  { name: "Healthcare", type: "expense", icon: "heart-pulse", color: "#C65C54", is_default: true },
  { name: "Housing & Rent", type: "expense", icon: "home", color: "#174D3C", is_default: true },
  { name: "Utilities & Bills", type: "expense", icon: "zap", color: "#8C7A4E", is_default: true },
  { name: "Subscriptions", type: "expense", icon: "repeat", color: "#657766", is_default: true },
  { name: "Travel", type: "expense", icon: "plane", color: "#2B4A3E", is_default: true },
  { name: "Other Expense", type: "expense", icon: "tag", color: "#777B76", is_default: true },
  { name: "Salary", type: "income", icon: "briefcase", color: "#174D3C", is_default: true },
  { name: "Freelance", type: "income", icon: "laptop", color: "#2D5A47", is_default: true },
  { name: "Investments", type: "income", icon: "trending-up", color: "#B69B62", is_default: true },
  { name: "Dividends", type: "income", icon: "pie-chart", color: "#3A6351", is_default: true },
  { name: "Other Income", type: "income", icon: "plus-circle", color: "#777B76", is_default: true },
];

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [isConfigured] = useState(isSupabaseConfigured());
  const [supabase] = useState(() => (isSupabaseConfigured() ? createClient() : null));

  const [user, setUser] = useState<{ id: string; email: string; full_name?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRangeOption["value"]>("this_month");

  const loadLocalStorageData = React.useCallback((userId: string) => {
    const dataKey = `antigravity_data_${userId}`;
    const raw = localStorage.getItem(dataKey);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setAccounts(data.accounts || []);
        setCategories(data.categories || []);
        setTransactions(data.transactions || []);
        setBudgets(data.budgets || []);
        setRecurring(data.recurring || []);
        setGoals(data.goals || []);
        setLoans(data.loans || []);
        setProfile(data.profile || null);
        setPreferences(data.preferences || null);
      } catch {
        // Ignore JSON parse errors
      }
    }
  }, []);

  const saveLocalStorageData = React.useCallback((userId: string, partial: Record<string, unknown>) => {
    const dataKey = `antigravity_data_${userId}`;
    const current = JSON.parse(localStorage.getItem(dataKey) || "{}");
    const updated = { ...current, ...partial };
    localStorage.setItem(dataKey, JSON.stringify(updated));
  }, []);

  const loadSupabaseData = React.useCallback(async (userId: string) => {
    if (!supabase) return;
    try {
      const [
        { data: prof },
        { data: accs },
        { data: cats },
        { data: txs },
        { data: bdgs },
        { data: recs },
        { data: gls },
        { data: lns },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("accounts").select("*").eq("user_id", userId).order("name"),
        supabase.from("categories").select("*").eq("user_id", userId).order("name"),
        supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }),
        supabase.from("budgets").select("*").eq("user_id", userId),
        supabase.from("recurring_transactions").select("*").eq("user_id", userId),
        supabase.from("savings_goals").select("*").eq("user_id", userId),
        supabase.from("loans").select("*").eq("user_id", userId),
      ]);

      if (prof) setProfile(prof as Profile);
      if (accs) setAccounts(accs as Account[]);
      if (cats) setCategories(cats as Category[]);
      if (txs) setTransactions(txs as Transaction[]);
      if (bdgs) setBudgets(bdgs as Budget[]);
      if (recs) setRecurring(recs as RecurringTransaction[]);
      if (gls) setGoals(gls as SavingsGoal[]);
      if (lns) setLoans(lns as Loan[]);
    } catch (err) {
      console.error("Error fetching Supabase data:", err);
    }
  }, [supabase]);

  // Load Initial Session & Data
  useEffect(() => {
    setIsMounted(true);
    async function init() {
      setIsLoading(true);
      if (isConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            full_name: session.user.user_metadata?.full_name,
          });
          await loadSupabaseData(session.user.id);
        } else {
          setUser(null);
        }
      } else {
        // Fallback / Sandbox storage when user has not yet configured Supabase keys
        const localUser = localStorage.getItem("antigravity_user");
        if (localUser) {
          try {
            const parsed = JSON.parse(localUser);
            setUser(parsed);
            loadLocalStorageData(parsed.id);
          } catch {
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    }
    init();
  }, [isConfigured, supabase, loadLocalStorageData, loadSupabaseData]);

  // Auth Functions
  const signIn = async (email: string, password: string) => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || "", full_name: data.user.user_metadata?.full_name });
        await loadSupabaseData(data.user.id);
      }
      return {};
    } else {
      // Local Auth Engine
      const mockId = "usr_" + btoa(email).slice(0, 8);
      const userObj = { id: mockId, email, full_name: email.split("@")[0] };
      setUser(userObj);
      localStorage.setItem("antigravity_user", JSON.stringify(userObj));
      loadLocalStorageData(mockId);
      return {};
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || "", full_name: fullName });
        await loadSupabaseData(data.user.id);
      }
      return {};
    } else {
      // Local Auth Engine
      const mockId = "usr_" + btoa(email).slice(0, 8);
      const userObj = { id: mockId, email, full_name: fullName };
      setUser(userObj);
      localStorage.setItem("antigravity_user", JSON.stringify(userObj));

      // Seed Default Categories for new user
      const initialCats: Category[] = DEFAULT_CATEGORIES.map((c, i) => ({
        ...c,
        id: `cat_${Date.now()}_${i}`,
        user_id: mockId,
        created_at: new Date().toISOString(),
      }));

      const initialProfile: Profile = {
        id: mockId,
        email,
        full_name: fullName,
        avatar_url: null,
        preferred_currency: "INR",
        date_format: "DD/MM/YYYY",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCategories(initialCats);
      setProfile(initialProfile);
      setAccounts([]);
      setTransactions([]);
      setBudgets([]);
      setRecurring([]);
      setGoals([]);
      setLoans([]);

      saveLocalStorageData(mockId, {
        profile: initialProfile,
        categories: initialCats,
        accounts: [],
        transactions: [],
        budgets: [],
        recurring: [],
        goals: [],
        loans: [],
      });
      return {};
    }
  };

  const signOut = async () => {
    if (isConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setAccounts([]);
    setCategories([]);
    setTransactions([]);
    setBudgets([]);
    setRecurring([]);
    setGoals([]);
    setLoans([]);
    localStorage.removeItem("antigravity_user");
  };

  const updateProfile = async (fullName: string, preferredCurrency: string) => {
    if (!user) return;
    const updated: Profile = {
      ...(profile || {
        id: user.id,
        email: user.email,
        avatar_url: null,
        date_format: "DD/MM/YYYY",
        created_at: new Date().toISOString(),
      }),
      full_name: fullName,
      preferred_currency: preferredCurrency,
      updated_at: new Date().toISOString(),
    };
    setProfile(updated);

    if (isConfigured && supabase) {
      await supabase.from("profiles").upsert(updated);
    } else {
      saveLocalStorageData(user.id, { profile: updated });
    }
  };

  // ACCOUNTS CRUD
  const addAccount = async (accData: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return;
    const newAccount: Account = {
      ...accData,
      id: "acc_" + Date.now(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isConfigured && supabase) {
      const { data, error } = await supabase.from("accounts").insert({
        user_id: user.id,
        name: accData.name,
        type: accData.type,
        balance: accData.balance,
        currency: accData.currency || "INR",
        color: accData.color || "#174D3C",
        is_archived: false,
      }).select().single();
      if (!error && data) {
        setAccounts((prev) => [...prev, data as Account]);
      }
    } else {
      const updated = [...accounts, newAccount];
      setAccounts(updated);
      saveLocalStorageData(user.id, { accounts: updated });
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    if (!user) return;
    const updated = accounts.map((a) => (a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a));
    setAccounts(updated);

    if (isConfigured && supabase) {
      await supabase.from("accounts").update(updates).eq("id", id).eq("user_id", user.id);
    } else {
      saveLocalStorageData(user.id, { accounts: updated });
    }
  };

  const deleteAccount = async (id: string) => {
    if (!user) return;
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);

    if (isConfigured && supabase) {
      await supabase.from("accounts").delete().eq("id", id).eq("user_id", user.id);
    } else {
      saveLocalStorageData(user.id, { accounts: updated });
    }
  };

  const transferFunds = async (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => {
    if (!user || amount <= 0 || fromAccountId === toAccountId) return;
    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);
    if (!fromAcc || !toAcc) return;

    if (isConfigured && supabase) {
      await supabase.rpc("perform_account_transfer", {
        p_user_id: user.id,
        p_from_account_id: fromAccountId,
        p_to_account_id: toAccountId,
        p_amount: amount,
        p_title: `Transfer to ${toAcc.name}`,
        p_date: new Date().toISOString().split("T")[0],
        p_description: notes || "Internal account transfer",
      });
      await loadSupabaseData(user.id);
    } else {
      // Atomic local balance update
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: acc.balance - amount, updated_at: new Date().toISOString() };
        }
        if (acc.id === toAccountId) {
          return { ...acc, balance: acc.balance + amount, updated_at: new Date().toISOString() };
        }
        return acc;
      });

      const newTx: Transaction = {
        id: "tx_" + Date.now(),
        user_id: user.id,
        account_id: fromAccountId,
        destination_account_id: toAccountId,
        title: `Transfer to ${toAcc.name}`,
        amount,
        type: "transfer",
        date: new Date().toISOString().split("T")[0],
        payment_method: "Transfer",
        description: notes || "Internal account transfer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedTxs = [newTx, ...transactions];
      setAccounts(updatedAccounts);
      setTransactions(updatedTxs);
      saveLocalStorageData(user.id, { accounts: updatedAccounts, transactions: updatedTxs });
    }
  };

  // TRANSACTIONS CRUD
  const addTransaction = async (txData: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return;
    const newTx: Transaction = {
      ...txData,
      id: "tx_" + Date.now(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update account balance
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === txData.account_id) {
        const delta = txData.type === "income" ? txData.amount : -txData.amount;
        return { ...acc, balance: acc.balance + delta, updated_at: new Date().toISOString() };
      }
      return acc;
    });

    if (isConfigured && supabase) {
      const { data, error } = await supabase.from("transactions").insert({
        user_id: user.id,
        account_id: txData.account_id,
        category_id: txData.category_id,
        title: txData.title,
        amount: txData.amount,
        type: txData.type,
        date: txData.date,
        payment_method: txData.payment_method,
        description: txData.description,
      }).select().single();

      if (!error && data) {
        setTransactions((prev) => [data as Transaction, ...prev]);
        const targetAcc = updatedAccounts.find((a) => a.id === txData.account_id);
        if (targetAcc) {
          await supabase.from("accounts").update({ balance: targetAcc.balance }).eq("id", targetAcc.id);
        }
        setAccounts(updatedAccounts);
      }
    } else {
      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);
      setAccounts(updatedAccounts);
      saveLocalStorageData(user.id, { transactions: updatedTxs, accounts: updatedAccounts });
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    const existing = transactions.find((t) => t.id === id);
    if (!existing) return;

    // Recalculate account balance differences if amount or type changed
    let updatedAccounts = [...accounts];
    if (updates.amount !== undefined || updates.type !== undefined) {
      const targetAccId = updates.account_id || existing.account_id;
      const oldDelta = existing.type === "income" ? existing.amount : -existing.amount;
      const newType = updates.type || existing.type;
      const newAmount = updates.amount !== undefined ? updates.amount : existing.amount;
      const newDelta = newType === "income" ? newAmount : -newAmount;
      const diff = newDelta - oldDelta;

      updatedAccounts = updatedAccounts.map((a) =>
        a.id === targetAccId ? { ...a, balance: a.balance + diff } : a
      );
    }

    const updatedTxs = transactions.map((t) =>
      t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    );

    setTransactions(updatedTxs);
    setAccounts(updatedAccounts);

    if (isConfigured && supabase) {
      await supabase.from("transactions").update(updates).eq("id", id).eq("user_id", user.id);
      const targetAcc = updatedAccounts.find((a) => a.id === existing.account_id);
      if (targetAcc) {
        await supabase.from("accounts").update({ balance: targetAcc.balance }).eq("id", targetAcc.id);
      }
    } else {
      saveLocalStorageData(user.id, { transactions: updatedTxs, accounts: updatedAccounts });
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Reverse balance change
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === tx.account_id) {
        const revertDelta = tx.type === "income" ? -tx.amount : tx.amount;
        return { ...acc, balance: acc.balance + revertDelta };
      }
      return acc;
    });

    const updatedTxs = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTxs);
    setAccounts(updatedAccounts);

    if (isConfigured && supabase) {
      await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
      const targetAcc = updatedAccounts.find((a) => a.id === tx.account_id);
      if (targetAcc) {
        await supabase.from("accounts").update({ balance: targetAcc.balance }).eq("id", targetAcc.id);
      }
    } else {
      saveLocalStorageData(user.id, { transactions: updatedTxs, accounts: updatedAccounts });
    }
  };

  // CATEGORIES CRUD
  const addCategory = async (catData: Omit<Category, "id" | "user_id" | "created_at">) => {
    if (!user) return;
    const newCat: Category = {
      ...catData,
      id: "cat_" + Date.now(),
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    if (isConfigured && supabase) {
      const { data, error } = await supabase.from("categories").insert({
        user_id: user.id,
        name: catData.name,
        type: catData.type,
        icon: catData.icon,
        color: catData.color,
        is_default: false,
      }).select().single();
      if (!error && data) {
        setCategories((prev) => [...prev, data as Category]);
      }
    } else {
      const updated = [...categories, newCat];
      setCategories(updated);
      saveLocalStorageData(user.id, { categories: updated });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);

    if (isConfigured && supabase) {
      await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id);
    } else {
      saveLocalStorageData(user.id, { categories: updated });
    }
  };

  // BUDGETS
  const setBudget = async (categoryId: string, amount: number, monthYear: string) => {
    if (!user) return;
    const existingIndex = budgets.findIndex((b) => b.category_id === categoryId && b.month_year === monthYear);
    let updated: Budget[];

    if (existingIndex >= 0) {
      updated = budgets.map((b, idx) =>
        idx === existingIndex ? { ...b, amount, updated_at: new Date().toISOString() } : b
      );
    } else {
      const newBudget: Budget = {
        id: "bdg_" + Date.now(),
        user_id: user.id,
        category_id: categoryId,
        amount,
        month_year: monthYear,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      updated = [...budgets, newBudget];
    }

    setBudgets(updated);

    if (isConfigured && supabase) {
      await supabase.from("budgets").upsert({
        user_id: user.id,
        category_id: categoryId,
        amount,
        month_year: monthYear,
      }, { onConflict: "user_id, category_id, month_year" });
    } else {
      saveLocalStorageData(user.id, { budgets: updated });
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);

    if (isConfigured && supabase) {
      await supabase.from("budgets").delete().eq("id", id).eq("user_id", user.id);
    } else {
      saveLocalStorageData(user.id, { budgets: updated });
    }
  };

  // RECURRING TRANSACTIONS
  const addRecurring = async (recData: Omit<RecurringTransaction, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return;
    const newRec: RecurringTransaction = {
      ...recData,
      id: "rec_" + Date.now(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isConfigured && supabase) {
      const { data, error } = await supabase.from("recurring_transactions").insert({
        user_id: user.id,
        account_id: recData.account_id,
        category_id: recData.category_id,
        title: recData.title,
        amount: recData.amount,
        type: recData.type,
        frequency: recData.frequency,
        start_date: recData.start_date,
        next_due_date: recData.next_due_date,
        is_active: recData.is_active,
        description: recData.description,
      }).select().single();
      if (!error && data) {
        setRecurring((prev) => [...prev, data as RecurringTransaction]);
      }
    } else {
      const updated = [...recurring, newRec];
      setRecurring(updated);
      saveLocalStorageData(user.id, { recurring: updated });
    }
  };

  const toggleRecurring = async (id: string) => {
    if (!user) return;
    const updated = recurring.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r));
    setRecurring(updated);

    if (isConfigured && supabase) {
      const item = updated.find((r) => r.id === id);
      if (item) {
        await supabase.from("recurring_transactions").update({ is_active: item.is_active }).eq("id", id).eq("user_id", user.id);
      }
    } else {
      saveLocalStorageData(user.id, { recurring: updated });
    }
  };

  const deleteRecurring = async (id: string) => {
    if (!user) return;
    const updated = recurring.filter((r) => r.id !== id);
    setRecurring(updated);

    if (isConfigured && supabase) {
      await supabase.from("recurring_transactions").delete().eq("id", id).eq("user_id", user.id);
    } else {
      saveLocalStorageData(user.id, { recurring: updated });
    }
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

        // Update recurring next date
        const updated = recurring.map((r) => (r.id === item.id ? { ...r, next_due_date: nextDateStr } : r));
        setRecurring(updated);

        if (isConfigured && supabase) {
          await supabase.from("recurring_transactions").update({ next_due_date: nextDateStr }).eq("id", item.id);
        } else {
          saveLocalStorageData(user.id, { recurring: updated });
        }
        processedCount++;
      }
    }
    return processedCount;
  };

  // SAVINGS GOALS
  const addGoal = async (goalData: Omit<SavingsGoal, "id" | "user_id" | "created_at" | "updated_at" | "current_amount" | "status">) => {
    if (!user) return;
    const newGoal: SavingsGoal = {
      ...goalData,
      id: "goal_" + Date.now(),
      user_id: user.id,
      current_amount: 0,
      status: "in_progress",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isConfigured && supabase) {
      const { data, error } = await supabase.from("savings_goals").insert({
        user_id: user.id,
        name: goalData.name,
        target_amount: goalData.target_amount,
        target_date: goalData.target_date,
        description: goalData.description,
      }).select().single();
      if (!error && data) {
        setGoals((prev) => [...prev, data as SavingsGoal]);
      }
    } else {
      const updated = [...goals, newGoal];
      setGoals(updated);
      saveLocalStorageData(user.id, { goals: updated });
    }
  };

  const contributeToGoal = async (goalId: string, accountId: string, amount: number, notes?: string) => {
    if (!user || amount <= 0) return;
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    // Deduct from selected account as goal savings expense
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return;

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

    const updatedGoals = goals.map((g) =>
      g.id === goalId ? { ...g, current_amount: newAmount, status, updated_at: new Date().toISOString() } : g
    );
    setGoals(updatedGoals);

    if (isConfigured && supabase) {
      await supabase.from("savings_goals").update({ current_amount: newAmount, status }).eq("id", goalId);
      await supabase.from("goal_contributions").insert({
        user_id: user.id,
        goal_id: goalId,
        account_id: accountId,
        amount,
        notes,
      });
    } else {
      saveLocalStorageData(user.id, { goals: updatedGoals });
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);

    if (isConfigured && supabase) {
      await supabase.from("savings_goals").delete().eq("id", id).eq("user_id", user.id);
    } else {
      saveLocalStorageData(user.id, { goals: updated });
    }
  };

  // LOANS & DEBTS
  const addLoan = async (loanData: Omit<Loan, "id" | "user_id" | "created_at" | "updated_at" | "paid_amount" | "status">) => {
    if (!user) return;
    const newLoan: Loan = {
      ...loanData,
      id: "loan_" + Date.now(),
      user_id: user.id,
      paid_amount: 0,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isConfigured && supabase) {
      const { data, error } = await supabase.from("loans").insert({
        user_id: user.id,
        type: loanData.type,
        counterparty_name: loanData.counterparty_name,
        total_amount: loanData.total_amount,
        interest_rate: loanData.interest_rate,
        due_date: loanData.due_date,
        notes: loanData.notes,
      }).select().single();
      if (!error && data) {
        setLoans((prev) => [...prev, data as Loan]);
      }
    } else {
      const updated = [...loans, newLoan];
      setLoans(updated);
      saveLocalStorageData(user.id, { loans: updated });
    }
  };

  const recordLoanRepayment = async (loanId: string, accountId: string | null, amount: number, notes?: string) => {
    if (!user || amount <= 0) return;
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    // If an account was chosen, link repayment as transaction
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

    const updatedLoans = loans.map((l) =>
      l.id === loanId ? { ...l, paid_amount: newPaid, status, updated_at: new Date().toISOString() } : l
    );
    setLoans(updatedLoans);

    if (isConfigured && supabase) {
      await supabase.from("loans").update({ paid_amount: newPaid, status }).eq("id", loanId);
      await supabase.from("loan_repayments").insert({
        user_id: user.id,
        loan_id: loanId,
        account_id: accountId,
        amount,
        notes,
      });
    } else {
      saveLocalStorageData(user.id, { loans: updatedLoans });
    }
  };

  const deleteLoan = async (id: string) => {
    if (!user) return;
    const updated = loans.filter((l) => l.id !== id);
    setLoans(updated);

    if (isConfigured && supabase) {
      await supabase.from("loans").delete().eq("id", id).eq("user_id", user.id);
    } else {
      saveLocalStorageData(user.id, { loans: updated });
    }
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
        isConfigured,
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
