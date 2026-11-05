"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Topbar } from "@/components/layout/topbar";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, Plus, Trash2, ShieldAlert } from "lucide-react";

export default function BudgetsPage() {
  const {
    budgets,
    categories,
    transactions,
    setBudget,
    deleteBudget,
    preferredCurrency,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("2026-11"); // YYYY-MM
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setSelectedMonth(new Date().toISOString().slice(0, 7));
  }, []);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Calculate actual spending per category for selected month
  const categoryBudgets = expenseCategories.map((cat) => {
    const budgetObj = budgets.find((b) => b.category_id === cat.id && b.month_year === selectedMonth);
    const limit = budgetObj ? Number(budgetObj.amount) : 0;

    const spent = transactions
      .filter((t) => t.type === "expense" && t.category_id === cat.id && t.date.startsWith(selectedMonth))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const remaining = limit - spent;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    const isExceeded = spent > limit && limit > 0;

    return {
      category: cat,
      budgetId: budgetObj?.id,
      limit,
      spent,
      remaining,
      percentage,
      isExceeded,
      hasBudget: limit > 0,
    };
  });

  const activeBudgets = categoryBudgets.filter((b) => b.hasBudget);
  const totalBudgeted = activeBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpentInBudgeted = activeBudgets.reduce((sum, b) => sum + b.spent, 0);
  const overallUtilization = totalBudgeted > 0 ? (totalSpentInBudgeted / totalBudgeted) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please specify a budget amount greater than 0.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    await setBudget(categoryId, parsedAmount, selectedMonth);
    setIsModalOpen(false);
    setAmount("");
    setCategoryId("");
  };

  return (
    <div className="min-h-full">
      <Topbar
        title="Budget Allocation"
        description="Establish category spending ceilings and monitor overspending limits"
        showDateRange={false}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Month Selector & Aggregate Progress Bar */}
        <div className="p-5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-[#777B76] uppercase tracking-wider block">
                Target Budget Period
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mt-1 px-3 py-1.5 border border-[#E7E6DF] rounded bg-[#F8F7F2] text-xs font-semibold focus:outline-none focus:border-[#174D3C]"
              />
            </div>

            <button
              onClick={() => {
                setCategoryId(expenseCategories[0]?.id || "");
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#F8F7F2] bg-[#174D3C] hover:bg-[#0E362A] rounded transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Set Category Budget</span>
            </button>
          </div>

          {totalBudgeted > 0 ? (
            <div className="pt-3 border-t border-[#E7E6DF] space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[#777B76]">
                  Total Outflow:{" "}
                  <strong className="text-[#171A18] num-tabular">
                    {formatCurrency(totalSpentInBudgeted, preferredCurrency)}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-[#171A18] num-tabular">
                    {formatCurrency(totalBudgeted, preferredCurrency)}
                  </strong>
                </span>
                <span
                  className={`font-semibold num-tabular ${
                    overallUtilization > 100 ? "text-[#C65C54]" : "text-[#174D3C]"
                  }`}
                >
                  {overallUtilization.toFixed(1)}% Allocated
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#E7E6DF] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    overallUtilization > 100 ? "bg-[#C65C54]" : "bg-[#174D3C]"
                  }`}
                  style={{ width: `${Math.min(100, overallUtilization)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#777B76] pt-2 border-t border-[#E7E6DF]">
              No budgets established for {selectedMonth}. Click above to set your category ceilings.
            </p>
          )}
        </div>

        {/* Category Budget Cards */}
        {activeBudgets.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="No Category Budgets Active"
            description="Establish spending targets to keep your living expenses and subscriptions within planned boundaries."
            actionText="Create Category Budget"
            onAction={() => {
              setCategoryId(expenseCategories[0]?.id || "");
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBudgets.map((b) => (
              <div
                key={b.category.id}
                className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5 flex flex-col justify-between hover:border-[#174D3C]/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#174D3C]" />
                      <h4 className="text-xs font-semibold text-[#171A18]">{b.category.name}</h4>
                    </div>
                    {b.isExceeded ? (
                      <Badge variant="red" className="flex items-center gap-1 text-[10px]">
                        <ShieldAlert className="w-3 h-3" /> Overspent
                      </Badge>
                    ) : (
                      <Badge variant="sage" className="text-[10px]">
                        {(100 - b.percentage).toFixed(0)}% Left
                      </Badge>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 my-3">
                    <div className="w-full h-2 bg-[#E7E6DF] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          b.isExceeded ? "bg-[#C65C54]" : "bg-[#174D3C]"
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div>
                      <span className="text-[10px] text-[#777B76] block">Spent</span>
                      <span className="font-semibold num-tabular text-[#171A18]">
                        {formatCurrency(b.spent, preferredCurrency)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#777B76] block">Limit</span>
                      <span className="font-semibold num-tabular text-[#171A18]">
                        {formatCurrency(b.limit, preferredCurrency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E7E6DF] flex items-center justify-between text-xs">
                  <span
                    className={`font-medium ${
                      b.remaining >= 0 ? "text-[#174D3C]" : "text-[#C65C54]"
                    }`}
                  >
                    {b.remaining >= 0
                      ? `${formatCurrency(b.remaining, preferredCurrency)} remaining`
                      : `${formatCurrency(Math.abs(b.remaining), preferredCurrency)} over budget`}
                  </span>

                  {b.budgetId && (
                    <button
                      onClick={() => deleteBudget(b.budgetId!)}
                      className="p-1 rounded text-[#777B76] hover:text-[#C65C54] hover:bg-[#C65C54]/10 transition-colors"
                      title="Remove Budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Set Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Establish Category Spending Limit"
        description={`Set maximum monthly expenditure for ${selectedMonth}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded bg-[#C65C54]/10 border border-[#C65C54]/20 text-[#C65C54] font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Expense Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Budget Limit ({preferredCurrency}) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-sm font-semibold num-tabular focus:outline-none focus:border-[#174D3C]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E6DF]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-[#E7E6DF] rounded text-xs text-[#777B76] hover:bg-[#F8F7F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#174D3C] text-[#F8F7F2] rounded text-xs font-medium hover:bg-[#0E362A]"
            >
              Save Budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
