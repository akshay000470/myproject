"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "@/context/finance-context";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  Download,
  PieChart as PieIcon,
  Layers,
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

export default function ReportsPage() {
  const {
    transactions,
    accounts,
    categories,
    preferredCurrency,
  } = useFinance();

  const [selectedYear, setSelectedYear] = useState("2026");

  React.useEffect(() => {
    setSelectedYear(new Date().getFullYear().toString());
  }, []);

  // Aggregate by Month for the selected Year
  const monthlyData = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const data = months.map((month, idx) => ({
      month,
      monthIndex: idx,
      income: 0,
      expense: 0,
      savings: 0,
    }));

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (d.getFullYear().toString() === selectedYear) {
        const m = d.getMonth();
        if (tx.type === "income") data[m].income += Number(tx.amount);
        if (tx.type === "expense") data[m].expense += Number(tx.amount);
        data[m].savings = data[m].income - data[m].expense;
      }
    });

    return data;
  }, [transactions, selectedYear]);

  // Category distribution for selected year
  const categoryYearly = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getFullYear().toString() === selectedYear && t.type === "expense") {
        const cat = categories.find((c) => c.id === t.category_id);
        const name = cat ? cat.name : "Uncategorized";
        map.set(name, (map.get(name) || 0) + Number(t.amount));
      }
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, selectedYear]);

  // Account asset distribution
  const accountDistribution = useMemo(() => {
    return accounts
      .filter((a) => a.balance > 0)
      .map((a) => ({ name: a.name, value: Number(a.balance) }));
  }, [accounts]);

  const yearTotalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const yearTotalExpense = monthlyData.reduce((s, m) => s + m.expense, 0);
  const yearNetSavings = yearTotalIncome - yearTotalExpense;
  const yearSavingsRate = yearTotalIncome > 0 ? (yearNetSavings / yearTotalIncome) * 100 : 0;

  const COLORS = ["#174D3C", "#B69B62", "#C65C54", "#5A6B5C", "#2D5A47", "#8C7A4E", "#777B76"];

  const handleExportYearlyReport = () => {
    const headers = ["Month", "Income", "Expense", "Net Savings", "Currency"];
    const rows = monthlyData.map((m) => [
      m.month,
      m.income,
      m.expense,
      m.savings,
      preferredCurrency,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financial_report_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-full">
      <Topbar
        title="Financial Reports & Analytics"
        description="Comprehensive historical audits, category dynamics and annual trends"
        showDateRange={false}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#777B76]">Analysis Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 border border-[#E7E6DF] rounded bg-[#F8F7F2] font-semibold text-xs focus:outline-none focus:border-[#174D3C]"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr.toString()}>
                  Fiscal Year {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportYearlyReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#171A18] bg-[#F8F7F2] border border-[#E7E6DF] hover:bg-[#E7E6DF]/50 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#174D3C]" />
            <span>Export Annual Statement (CSV)</span>
          </button>
        </div>

        {/* Annual KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md">
            <span className="text-[11px] font-semibold text-[#777B76] uppercase tracking-wider block">
              Annual Inflow
            </span>
            <span className="text-2xl font-bold text-[#174D3C] tracking-tight num-tabular mt-1 block">
              {formatCurrency(yearTotalIncome, preferredCurrency)}
            </span>
            <p className="text-[11px] text-[#777B76] mt-0.5">Total recorded revenue</p>
          </div>

          <div className="p-5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md">
            <span className="text-[11px] font-semibold text-[#777B76] uppercase tracking-wider block">
              Annual Outflow
            </span>
            <span className="text-2xl font-bold text-[#C65C54] tracking-tight num-tabular mt-1 block">
              {formatCurrency(yearTotalExpense, preferredCurrency)}
            </span>
            <p className="text-[11px] text-[#777B76] mt-0.5">Total recorded expenditures</p>
          </div>

          <div className="p-5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md">
            <span className="text-[11px] font-semibold text-[#777B76] uppercase tracking-wider block">
              Annual Net Savings
            </span>
            <span
              className={`text-2xl font-bold tracking-tight num-tabular mt-1 block ${
                yearNetSavings >= 0 ? "text-[#171A18]" : "text-[#C65C54]"
              }`}
            >
              {formatCurrency(yearNetSavings, preferredCurrency)}
            </span>
            <p className="text-[11px] text-[#777B76] mt-0.5">Net retained capital</p>
          </div>

          <div className="p-5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md">
            <span className="text-[11px] font-semibold text-[#777B76] uppercase tracking-wider block">
              Capital Retention Rate
            </span>
            <span className="text-2xl font-bold text-[#174D3C] tracking-tight num-tabular mt-1 block">
              {yearSavingsRate.toFixed(1)}%
            </span>
            <p className="text-[11px] text-[#777B76] mt-0.5">Retained of gross earnings</p>
          </div>
        </div>

        {/* Month-over-Month Cashflow Graph */}
        <div className="p-5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
              Month-over-Month Cashflow Trajectory
            </h3>
            <p className="text-[11px] text-[#777B76]">
              Comparison of income and expense trends throughout {selectedYear}
            </p>
          </div>

          <div className="h-72 w-full">
            {yearTotalIncome === 0 && yearTotalExpense === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No Data for Selected Fiscal Year"
                description={`No transaction records detected for ${selectedYear}. Record transactions to generate annual reports.`}
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E6DF" vertical={false} />
                  <XAxis dataKey="month" stroke="#777B76" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#777B76"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E7E6DF",
                      borderRadius: "4px",
                      fontSize: "11px",
                    }}
                    formatter={(val: any) => formatCurrency(Number(val) || 0, preferredCurrency)}
                  />
                  <Bar dataKey="income" name="Income" fill="#174D3C" radius={[2, 2, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expense" name="Expense" fill="#C65C54" radius={[2, 2, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Lower Row: Category Distribution & Asset Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Annual Category Expenses */}
          <div className="p-5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
                Annual Expenditure Breakdown
              </h3>
              <p className="text-[11px] text-[#777B76]">Category weights for {selectedYear}</p>
            </div>

            {categoryYearly.length === 0 ? (
              <EmptyState
                icon={PieIcon}
                title="No Annual Expenses"
                description={`No expenses logged for fiscal year ${selectedYear}.`}
              />
            ) : (
              <div className="space-y-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryYearly}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryYearly.map((entry, index) => (
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
                        formatter={(val: any) => formatCurrency(Number(val) || 0, preferredCurrency)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="divide-y divide-[#E7E6DF] text-xs">
                  {categoryYearly.map((item, idx) => (
                    <div key={item.name} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-medium text-[#171A18]">{item.name}</span>
                      </div>
                      <span className="font-semibold num-tabular text-[#171A18]">
                        {formatCurrency(item.value, preferredCurrency)} (
                        {((item.value / yearTotalExpense) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Account Balance Distribution */}
          <div className="p-5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
                Asset Allocation by Portfolio Account
              </h3>
              <p className="text-[11px] text-[#777B76]">Current distribution across vaults</p>
            </div>

            {accountDistribution.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="No Positive Balances"
                description="Connect accounts with active balances to analyze distribution."
              />
            ) : (
              <div className="space-y-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={accountDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {accountDistribution.map((entry, index) => (
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
                        formatter={(val: any) => formatCurrency(Number(val) || 0, preferredCurrency)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="divide-y divide-[#E7E6DF] text-xs">
                  {accountDistribution.map((acc, idx) => (
                    <div key={acc.name} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-medium text-[#171A18]">{acc.name}</span>
                      </div>
                      <span className="font-semibold num-tabular text-[#171A18]">
                        {formatCurrency(acc.value, preferredCurrency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
