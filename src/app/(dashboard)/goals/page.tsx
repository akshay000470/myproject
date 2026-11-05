"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Topbar } from "@/components/layout/topbar";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SavingsGoal } from "@/types/database";
import {
  Target,
  Plus,
  Coins,
  Trash2,
  Calendar,
} from "lucide-react";

export default function SavingsGoalsPage() {
  const {
    goals,
    accounts,
    addGoal,
    contributeToGoal,
    deleteGoal,
    preferredCurrency,
  } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);

  // New Goal Form State
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Contribution Form State
  const [contribAmount, setContribAmount] = useState("");
  const [contribAccountId, setContribAccountId] = useState(accounts[0]?.id || "");
  const [contribNotes, setContribNotes] = useState("");
  const [contribError, setContribError] = useState<string | null>(null);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedTarget = parseFloat(targetAmount);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError("Please specify a target amount greater than 0.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a goal title.");
      return;
    }

    await addGoal({
      name: name.trim(),
      target_amount: parsedTarget,
      target_date: targetDate || null,
      description: description || null,
    });

    setName("");
    setTargetAmount("");
    setTargetDate("");
    setDescription("");
    setIsAddOpen(false);
  };

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContribError(null);

    if (!contributeGoal) return;
    const amt = parseFloat(contribAmount);
    if (isNaN(amt) || amt <= 0) {
      setContribError("Enter an amount greater than 0.");
      return;
    }

    if (!contribAccountId) {
      setContribError("Please select a funding account.");
      return;
    }

    const fundingAcc = accounts.find((a) => a.id === contribAccountId);
    if (fundingAcc && fundingAcc.balance < amt) {
      setContribError(`Insufficient balance in ${fundingAcc.name}.`);
      return;
    }

    await contributeToGoal(contributeGoal.id, contribAccountId, amt, contribNotes);
    setContributeGoal(null);
    setContribAmount("");
    setContribNotes("");
  };

  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="min-h-full">
      <Topbar
        title="Savings Goals & Reserves"
        description="Allocate wealth reserves toward future milestones, emergency funds, and acquisitions"
        showDateRange={false}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Progress Header */}
        <div className="p-5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-[11px] font-semibold text-[#777B76] uppercase tracking-wider block">
              Aggregate Savings Progress
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#171A18] tracking-tight num-tabular">
                {formatCurrency(totalSaved, preferredCurrency)}
              </span>
              <span className="text-xs text-[#777B76]">
                of {formatCurrency(totalTarget, preferredCurrency)} ({overallProgress.toFixed(0)}%)
              </span>
            </div>
            {totalTarget > 0 && (
              <div className="w-full max-w-md h-2 bg-[#E7E6DF] rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-[#174D3C] transition-all duration-300"
                  style={{ width: `${Math.min(100, overallProgress)}%` }}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#F8F7F2] bg-[#174D3C] hover:bg-[#0E362A] rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Goal</span>
          </button>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No Financial Goals Created"
            description="Establish dedicated capital accumulation targets for your emergency cushion, investments, or travel plans."
            actionText="Create First Goal"
            onAction={() => setIsAddOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((g) => {
              const progressPct = (g.current_amount / g.target_amount) * 100;
              const remaining = Math.max(0, g.target_amount - g.current_amount);
              const isCompleted = g.status === "completed" || progressPct >= 100;

              return (
                <div
                  key={g.id}
                  className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5 flex flex-col justify-between hover:border-[#174D3C]/30 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-[#171A18]">{g.name}</h4>
                        {g.description && (
                          <p className="text-[11px] text-[#777B76] mt-0.5">{g.description}</p>
                        )}
                      </div>
                      <Badge variant={isCompleted ? "dark" : "sage"}>
                        {isCompleted ? "Achieved" : `${progressPct.toFixed(0)}%`}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="my-4 space-y-1.5">
                      <div className="w-full h-2 bg-[#E7E6DF] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isCompleted ? "bg-[#B69B62]" : "bg-[#174D3C]"
                          }`}
                          style={{ width: `${Math.min(100, progressPct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-[#777B76]">
                        <span className="num-tabular font-medium text-[#171A18]">
                          {formatCurrency(g.current_amount, preferredCurrency)}
                        </span>
                        <span className="num-tabular">
                          Target: {formatCurrency(g.target_amount, preferredCurrency)}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#777B76] flex items-center justify-between pt-1">
                      <span>Remaining: {formatCurrency(remaining, preferredCurrency)}</span>
                      {g.target_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(g.target_date)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E7E6DF] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setContribAccountId(accounts[0]?.id || "");
                        setContributeGoal(g);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#DCE8DE] hover:bg-[#DCE8DE]/70 text-[#174D3C] text-xs font-medium rounded transition-colors"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Add Capital</span>
                    </button>

                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="p-1 rounded text-[#777B76] hover:text-[#C65C54] hover:bg-[#C65C54]/10 transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Establish Financial Goal"
        description="Target milestone and capital requirement"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded bg-[#C65C54]/10 border border-[#C65C54]/20 text-[#C65C54] font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Goal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 6-Month Emergency Fund, Vehicle Downpayment"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Target Amount ({preferredCurrency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-sm font-semibold num-tabular focus:outline-none focus:border-[#174D3C]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Target Maturity Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Context Notes
            </label>
            <textarea
              rows={2}
              placeholder="Rationale or milestones"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E6DF]">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-[#E7E6DF] rounded text-xs text-[#777B76] hover:bg-[#F8F7F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#174D3C] text-[#F8F7F2] rounded text-xs font-medium hover:bg-[#0E362A]"
            >
              Create Goal
            </button>
          </div>
        </form>
      </Modal>

      {/* Contribute Capital Modal */}
      {contributeGoal && (
        <Modal
          isOpen={true}
          onClose={() => setContributeGoal(null)}
          title={`Fund Goal: ${contributeGoal.name}`}
          description="Deduct capital from an existing account and credit this reserve"
        >
          <form onSubmit={handleContributeSubmit} className="space-y-4 text-xs">
            {contribError && (
              <div className="p-2.5 rounded bg-[#C65C54]/10 border border-[#C65C54]/20 text-[#C65C54] font-medium">
                {contribError}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Funding Account *
              </label>
              <select
                value={contribAccountId}
                onChange={(e) => setContribAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatCurrency(a.balance, a.currency)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Contribution Amount ({preferredCurrency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-sm font-semibold num-tabular focus:outline-none focus:border-[#174D3C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Allocation Note
              </label>
              <input
                type="text"
                placeholder="e.g. Month-end bonus allocation"
                value={contribNotes}
                onChange={(e) => setContribNotes(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E6DF]">
              <button
                type="button"
                onClick={() => setContributeGoal(null)}
                className="px-4 py-2 border border-[#E7E6DF] rounded text-xs text-[#777B76] hover:bg-[#F8F7F2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#174D3C] text-[#F8F7F2] rounded text-xs font-medium hover:bg-[#0E362A]"
              >
                Deposit Funds
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
