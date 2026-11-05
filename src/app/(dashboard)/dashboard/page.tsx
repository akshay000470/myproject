"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Topbar } from "@/components/layout/topbar";
import { AddTransactionModal } from "@/components/modals/add-transaction-modal";
import { AddAccountModal } from "@/components/modals/add-account-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarClock,
  Plus,
  Receipt,
  ShieldAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const {
    accounts,
    categories,
    transactions,
    filteredTransactions,
    budgets,
    recurring,
    goals,
    netBalance,
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    preferredCurrency,
    selectedRange,
  } = useFinance();

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("2026-11");
  const [currentMonthName, setCurrentMonthName] = useState("Current Month");

  React.useEffect(() => {
    const now = new Date();
    setCurrentMonth(now.toISOString().slice(0, 7));
    setCurrentMonthName(now.toLocaleString("default", { month: "long", year: "numeric" }));
  }, []);

  // Category breakdown for expenses
  const categorySpending = React.useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = categories.find((c) => c.id === t.category_id);
        const name = cat ? cat.name : "Uncategorized";
        map.set(name, (map.get(name) || 0) + Number(t.amount));
      });

    const entries = Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return entries;
  }, [filteredTransactions, categories]);

  // Income vs Expense grouped by recent days/months
  const chartData = React.useMemo(() => {
    if (filteredTransactions.length === 0) return [];

    // Group by transaction date (ordered chronologically)
    const dateMap = new Map<string, { date: string; income: number; expense: number }>();
    const sorted = [...filteredTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach((t) => {
      const d = t.date;
      if (!dateMap.has(d)) {
        dateMap.set(d, { date: formatDate(d), income: 0, expense: 0 });
      }
      const entry = dateMap.get(d)!;
      if (t.type === "income") entry.income += Number(t.amount);
      if (t.type === "expense") entry.expense += Number(t.amount);
    });

    return Array.from(dateMap.values()).slice(-7); // Last 7 active dates
  }, [filteredTransactions]);

  const COLORS = ["#174D3C", "#B69B62", "#C65C54", "#5A6B5C", "#2D5A47", "#8C7A4E", "#777B76"];

  // Monthly Budget Progress calculation
  const currentMonthBudgets = budgets.filter((b) => b.month_year === currentMonth);
  const totalBudgetLimit = currentMonthBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const currentMonthExpenses = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const budgetUtilization = totalBudgetLimit > 0 ? (currentMonthExpenses / totalBudgetLimit) * 100 : 0;
  const isBudgetExceeded = currentMonthExpenses > totalBudgetLimit && totalBudgetLimit > 0;

  // Upcoming recurring items (due next 14 days)
  const upcomingRecurring = recurring
    .filter((r) => r.is_active)
    .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-full">
      <Topbar
        title="Financial Overview"
        description="Comprehensive summary of assets, cashflow, and budget limits"
        onOpenAddTransaction={() => setIsAddTxOpen(true)}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Top Financial Stat Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Balance */}
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#777B76]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Total Net Balance
              </span>
              <Wallet className="w-4 h-4 text-[#174D3C]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-[#171A18] tracking-tight num-tabular">
                {formatCurrency(netBalance, preferredCurrency)}
              </span>
              <p className="text-[11px] text-[#777B76] mt-0.5">
                Across {accounts.length} active {accounts.length === 1 ? "account" : "accounts"}
              </p>
            </div>
          </div>

          {/* Total Income */}
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#777B76]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Period Income
              </span>
              <div className="w-5 h-5 rounded bg-[#174D3C]/10 text-[#174D3C] flex items-center justify-center">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-[#174D3C] tracking-tight num-tabular">
                {formatCurrency(totalIncome, preferredCurrency)}
              </span>
              <p className="text-[11px] text-[#777B76] mt-0.5 capitalize">
                {selectedRange.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#777B76]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Period Outflow
              </span>
              <div className="w-5 h-5 rounded bg-[#C65C54]/10 text-[#C65C54] flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-[#C65C54] tracking-tight num-tabular">
                {formatCurrency(totalExpenses, preferredCurrency)}
              </span>
              <p className="text-[11px] text-[#777B76] mt-0.5 capitalize">
                {selectedRange.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Monthly Savings */}
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#777B76]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Net Period Savings
              </span>
              <PiggyBank className="w-4 h-4 text-[#B69B62]" />
            </div>
            <div className="mt-3">
              <span
                className={`text-2xl font-bold tracking-tight num-tabular ${
                  netSavings >= 0 ? "text-[#171A18]" : "text-[#C65C54]"
                }`}
              >
                {formatCurrency(netSavings, preferredCurrency)}
              </span>
              <p className="text-[11px] text-[#777B76] mt-0.5">
                Savings Rate: <strong className="text-[#174D3C]">{savingsRate.toFixed(1)}%</strong>
              </p>
            </div>
          </div>
        </div>

        {/* If no accounts exist yet, show prominent setup guidance */}
        {accounts.length === 0 && (
          <div className="p-4 bg-[#DCE8DE]/40 border border-[#174D3C]/20 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#174D3C] text-[#F8F7F2] rounded">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#171A18]">
                  Set Up Your First Account
                </h4>
                <p className="text-xs text-[#777B76]">
                  Create a savings, current, cash or credit card account to start tracking transactions.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddAccountOpen(true)}
              className="px-3.5 py-1.5 bg-[#174D3C] hover:bg-[#0E362A] text-[#F8F7F2] text-xs font-medium rounded shadow-xs shrink-0"
            >
              Add First Account
            </button>
          </div>
        )}

        {/* Charts Section: Income vs Expense & Category Spending Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Cashflow Trend Bar Chart */}
          <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
                  Cashflow Activity
                </h3>
                <p className="text-[11px] text-[#777B76]">Income vs Expenses by active date</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-[#174D3C]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#174D3C]" /> Income
                </span>
                <span className="flex items-center gap-1.5 text-[#C65C54]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#C65C54]" /> Expense
                </span>
              </div>
            </div>

            <div className="h-64 w-full flex-1 min-h-[240px]">
              {chartData.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No Cashflow Data"
                  description="Record income and expense transactions to render dynamic cashflow analytics."
                  actionText="Record Transaction"
                  onAction={() => setIsAddTxOpen(true)}
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7E6DF" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#777B76"
                      fontSize={10}
                      tickLine={false}
                      axisLine={{ stroke: "#E7E6DF" }}
                    />
                    <YAxis
                      stroke="#777B76"
                      fontSize={10}
                      tickLine={false}
                      axisLine={{ stroke: "#E7E6DF" }}
                      tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E7E6DF",
                        borderRadius: "4px",
                        fontSize: "11px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      }}
                      formatter={(value: any) => formatCurrency(Number(value) || 0, preferredCurrency)}
                    />
                    <Bar dataKey="income" fill="#174D3C" radius={[2, 2, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="expense" fill="#C65C54" radius={[2, 2, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Spending Breakdown by Category */}
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5 flex flex-col">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
                Category Outflow
              </h3>
              <p className="text-[11px] text-[#777B76]">Distribution of expenses</p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {categorySpending.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No Expense Breakdown"
                  description="No categorized expenses recorded in this period."
                />
              ) : (
                <div className="space-y-4">
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySpending}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categorySpending.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#FFFFFF",
                            borderColor: "#E7E6DF",
                            borderRadius: "4px",
                            fontSize: "11px",
                          }}
                          formatter={(value: any) => formatCurrency(Number(value) || 0, preferredCurrency)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 border-t border-[#E7E6DF] pt-3 max-h-36 overflow-y-auto">
                    {categorySpending.map((item, idx) => {
                      const pct = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                      return (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            />
                            <span className="text-[#171A18] truncate font-medium">{item.name}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-semibold num-tabular text-[#171A18]">
                              {formatCurrency(item.value, preferredCurrency)}
                            </span>
                            <span className="text-[10px] text-[#777B76] ml-1.5">
                              ({pct.toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lower Row: Accounts Overview, Budget Progress, Upcoming Recurring & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Balances Overview */}
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
                  Connected Accounts
                </h3>
                <p className="text-[11px] text-[#777B76]">Current balances</p>
              </div>
              <button
                onClick={() => setIsAddAccountOpen(true)}
                className="p-1 rounded text-[#174D3C] hover:bg-[#DCE8DE] transition-colors"
                title="Add Account"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 flex-1">
              {accounts.length === 0 ? (
                <EmptyState
                  icon={Wallet}
                  title="No Accounts"
                  description="Add your first bank account or wallet."
                  actionText="Add Account"
                  onAction={() => setIsAddAccountOpen(true)}
                />
              ) : (
                accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3 border border-[#E7E6DF] rounded hover:border-[#174D3C]/30 transition-colors bg-[#F8F7F2]/40"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#171A18]">{acc.name}</p>
                      <span className="text-[10px] text-[#777B76] uppercase tracking-wider">
                        {acc.type.replace("_", " ")}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold num-tabular ${
                        acc.balance < 0 ? "text-[#C65C54]" : "text-[#174D3C]"
                      }`}
                    >
                      {formatCurrency(acc.balance, acc.currency || preferredCurrency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Monthly Budget Summary */}
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
                  Monthly Budget
                </h3>
                <p className="text-[11px] text-[#777B76]">
                  {currentMonthName}
                </p>
              </div>
              {isBudgetExceeded && (
                <Badge variant="red" className="flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Exceeded
                </Badge>
              )}
            </div>

            {totalBudgetLimit === 0 ? (
              <EmptyState
                icon={PiggyBank}
                title="No Budgets Defined"
                description="Set monthly spending limits for categories to prevent overspending."
              />
            ) : (
              <div className="space-y-4 flex-1 flex flex-col justify-center">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-[#777B76]">Utilization</span>
                    <span
                      className={`num-tabular font-semibold ${
                        isBudgetExceeded ? "text-[#C65C54]" : "text-[#174D3C]"
                      }`}
                    >
                      {budgetUtilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E7E6DF] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isBudgetExceeded ? "bg-[#C65C54]" : "bg-[#174D3C]"
                      }`}
                      style={{ width: `${Math.min(100, budgetUtilization)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E7E6DF] text-xs">
                  <div>
                    <span className="text-[10px] text-[#777B76] uppercase tracking-wider block">
                      Spent
                    </span>
                    <span className="font-semibold text-[#171A18] num-tabular">
                      {formatCurrency(currentMonthExpenses, preferredCurrency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777B76] uppercase tracking-wider block">
                      Total Limit
                    </span>
                    <span className="font-semibold text-[#171A18] num-tabular">
                      {formatCurrency(totalBudgetLimit, preferredCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Recurring & Goals */}
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5 flex flex-col">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
                Upcoming Recurring
              </h3>
              <p className="text-[11px] text-[#777B76]">Scheduled bills & subscriptions</p>
            </div>

            <div className="space-y-2.5 flex-1">
              {upcomingRecurring.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title="No Active Recurring"
                  description="Add recurring subscriptions or bills to track due dates."
                />
              ) : (
                upcomingRecurring.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 border border-[#E7E6DF] rounded bg-[#F8F7F2]/40 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#171A18]">{item.title}</p>
                      <span className="text-[10px] text-[#777B76]">
                        Due {formatDate(item.next_due_date)} • {item.frequency}
                      </span>
                    </div>
                    <span
                      className={`font-semibold num-tabular ${
                        item.type === "income" ? "text-[#174D3C]" : "text-[#C65C54]"
                      }`}
                    >
                      {item.type === "income" ? "+" : "-"}
                      {formatCurrency(item.amount, preferredCurrency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions Financial Ledger Table */}
        <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
                Recent Transactions
              </h3>
              <p className="text-[11px] text-[#777B76]">Latest financial operations</p>
            </div>
            {transactions.length > 0 && (
              <button
                onClick={() => setIsAddTxOpen(true)}
                className="text-xs text-[#174D3C] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Record Transaction
              </button>
            )}
          </div>

          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No Transactions Recorded"
              description="Your financial ledger is completely empty. Record your first transaction to initiate tracking."
              actionText="Record First Transaction"
              onAction={() => setIsAddTxOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E7E6DF] text-[#777B76] font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Account</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E6DF]">
                  {filteredTransactions.slice(0, 8).map((tx) => {
                    const acc = accounts.find((a) => a.id === tx.account_id);
                    const cat = categories.find((c) => c.id === tx.category_id);
                    return (
                      <tr key={tx.id} className="hover:bg-[#F8F7F2]/60 transition-colors">
                        <td className="py-3 px-3 text-[#777B76] font-medium num-tabular">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#171A18]">{tx.title}</td>
                        <td className="py-3 px-3 text-[#777B76]">{acc ? acc.name : "—"}</td>
                        <td className="py-3 px-3">
                          {cat ? (
                            <Badge variant="sage">{cat.name}</Badge>
                          ) : (
                            <span className="text-[#777B76]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[#777B76]">{tx.payment_method}</td>
                        <td
                          className={`py-3 px-3 text-right font-bold num-tabular ${
                            tx.type === "income"
                              ? "text-[#174D3C]"
                              : tx.type === "expense"
                              ? "text-[#C65C54]"
                              : "text-[#171A18]"
                          }`}
                        >
                          {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                          {formatCurrency(tx.amount, preferredCurrency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddTransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
      <AddAccountModal isOpen={isAddAccountOpen} onClose={() => setIsAddAccountOpen(false)} />
    </div>
  );
}
