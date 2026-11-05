"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Topbar } from "@/components/layout/topbar";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RecurringFrequency } from "@/types/database";
import {
  CalendarClock,
  Plus,
  Play,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
} from "lucide-react";

export default function RecurringPage() {
  const {
    recurring,
    accounts,
    categories,
    addRecurring,
    toggleRecurring,
    deleteRecurring,
    processDueRecurring,
    preferredCurrency,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [categoryId, setCategoryId] = useState("");
  const [nextDueDate, setNextDueDate] = useState("2026-11-05");
  const [todayStr, setTodayStr] = useState("2026-11-05");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processSuccessMsg, setProcessSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTodayStr(today);
    setNextDueDate(today);
  }, []);

  const availableCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please specify a valid recurring amount.");
      return;
    }

    if (!accountId) {
      setError("Please select an associated account.");
      return;
    }

    await addRecurring({
      account_id: accountId,
      category_id: categoryId || null,
      title: title.trim(),
      amount: parsedAmount,
      type,
      frequency,
      start_date: new Date().toISOString().split("T")[0],
      next_due_date: nextDueDate,
      is_active: true,
      description: description || null,
    });

    setTitle("");
    setAmount("");
    setDescription("");
    setIsModalOpen(false);
  };

  const handleProcessDue = async () => {
    setProcessSuccessMsg(null);
    const count = await processDueRecurring();
    if (count > 0) {
      setProcessSuccessMsg(`Successfully processed ${count} scheduled transaction(s) into your ledger.`);
    } else {
      setProcessSuccessMsg("No recurring transactions are currently due today.");
    }
    setTimeout(() => setProcessSuccessMsg(null), 4000);
  };

  return (
    <div className="min-h-full">
      <Topbar
        title="Recurring Commitments"
        description="Monitor automated subscriptions, utility obligations, and recurring retainers"
        showDateRange={false}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md">
          <div>
            <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
              Scheduled Payments Engine
            </h3>
            <p className="text-[11px] text-[#777B76]">
              {recurring.filter((r) => r.is_active).length} active schedules tracked
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleProcessDue}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#171A18] bg-[#F8F7F2] border border-[#E7E6DF] hover:bg-[#E7E6DF]/50 rounded transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-[#174D3C]" />
              <span>Process Due Items</span>
            </button>

            <button
              onClick={() => {
                setAccountId(accounts[0]?.id || "");
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#F8F7F2] bg-[#174D3C] hover:bg-[#0E362A] rounded transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Recurring</span>
            </button>
          </div>
        </div>

        {processSuccessMsg && (
          <div className="p-3 rounded bg-[#DCE8DE] border border-[#174D3C]/20 text-xs font-medium text-[#174D3C] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{processSuccessMsg}</span>
          </div>
        )}

        {/* Recurring List Table */}
        <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md overflow-hidden">
          {recurring.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CalendarClock}
                title="No Recurring Transactions Configured"
                description="Set up automatic tracking for recurring costs such as rent, software subscriptions, insurance, or regular client retainers."
                actionText="Add Recurring Commitment"
                onAction={() => {
                  setAccountId(accounts[0]?.id || "");
                  setIsModalOpen(true);
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E7E6DF] bg-[#F8F7F2]/60 text-[#777B76] font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Account</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Next Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E6DF]">
                  {recurring.map((rec) => {
                    const acc = accounts.find((a) => a.id === rec.account_id);
                    const isDue = rec.next_due_date <= todayStr;
                    return (
                      <tr key={rec.id} className="hover:bg-[#F8F7F2]/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#171A18]">{rec.title}</p>
                          {rec.description && (
                            <p className="text-[11px] text-[#777B76] line-clamp-1">{rec.description}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#777B76]">{acc ? acc.name : "—"}</td>
                        <td className="py-3.5 px-4 capitalize font-medium text-[#171A18]">
                          {rec.frequency}
                        </td>
                        <td className="py-3.5 px-4 num-tabular">
                          <span
                            className={
                              isDue && rec.is_active ? "text-[#C65C54] font-semibold" : "text-[#777B76]"
                            }
                          >
                            {formatDate(rec.next_due_date)} {isDue && rec.is_active && "(Due)"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={rec.is_active ? "sage" : "outline"}>
                            {rec.is_active ? "Active" : "Paused"}
                          </Badge>
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-bold num-tabular ${
                            rec.type === "income" ? "text-[#174D3C]" : "text-[#C65C54]"
                          }`}
                        >
                          {rec.type === "income" ? "+" : "-"}
                          {formatCurrency(rec.amount, preferredCurrency)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => toggleRecurring(rec.id)}
                              className="text-[#777B76] hover:text-[#171A18] transition-colors"
                              title={rec.is_active ? "Pause Schedule" : "Activate Schedule"}
                            >
                              {rec.is_active ? (
                                <ToggleRight className="w-5 h-5 text-[#174D3C]" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-[#777B76]" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteRecurring(rec.id)}
                              className="p-1 rounded text-[#777B76] hover:text-[#C65C54] hover:bg-[#C65C54]/10 transition-colors"
                              title="Delete Recurring"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* Add Recurring Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Recurring Commitment"
        description="Configure automated periodic income or expenses"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded bg-[#C65C54]/10 border border-[#C65C54]/20 text-[#C65C54] font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Schedule Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "expense" | "income")}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              >
                <option value="expense">Expense (Outflow)</option>
                <option value="income">Income (Inflow)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Frequency *
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Hosting, Rent, Netflix"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Amount ({preferredCurrency}) *
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Target Account *
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currency} {a.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Next Due Date *
              </label>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            >
              <option value="">None / Uncategorized</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
              Schedule Recurring
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
