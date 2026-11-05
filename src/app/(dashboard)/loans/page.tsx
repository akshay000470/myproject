"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Topbar } from "@/components/layout/topbar";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loan, LoanType } from "@/types/database";
import { HandCoins, Plus, ArrowUpRight, ArrowDownLeft, Trash2 } from "lucide-react";

export default function LoansPage() {
  const {
    loans,
    accounts,
    addLoan,
    recordLoanRepayment,
    deleteLoan,
    preferredCurrency,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<LoanType>("borrowed");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [repayLoan, setRepayLoan] = useState<Loan | null>(null);

  // New Loan Form State
  const [type, setType] = useState<LoanType>("borrowed");
  const [counterparty, setCounterparty] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("0");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Repayment Form State
  const [repayAmount, setRepayAmount] = useState("");
  const [repayAccountId, setRepayAccountId] = useState<string>("");
  const [repayNotes, setRepayNotes] = useState("");
  const [repayError, setRepayError] = useState<string | null>(null);

  const displayedLoans = loans.filter((l) => l.type === activeTab);

  const totalBorrowed = loans
    .filter((l) => l.type === "borrowed" && l.status === "active")
    .reduce((sum, l) => sum + (l.total_amount - l.paid_amount), 0);

  const totalLent = loans
    .filter((l) => l.type === "lent" && l.status === "active")
    .reduce((sum, l) => sum + (l.total_amount - l.paid_amount), 0);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please specify a principal amount greater than 0.");
      return;
    }

    if (!counterparty.trim()) {
      setError("Please specify the counterparty name.");
      return;
    }

    await addLoan({
      type,
      counterparty_name: counterparty.trim(),
      total_amount: parsedAmount,
      interest_rate: parseFloat(interestRate) || 0,
      due_date: dueDate || null,
      notes: notes || null,
    });

    setCounterparty("");
    setAmount("");
    setInterestRate("0");
    setDueDate("");
    setNotes("");
    setIsAddOpen(false);
  };

  const handleRepaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepayError(null);

    if (!repayLoan) return;
    const amt = parseFloat(repayAmount);
    if (isNaN(amt) || amt <= 0) {
      setRepayError("Please specify a repayment amount greater than 0.");
      return;
    }

    await recordLoanRepayment(repayLoan.id, repayAccountId || null, amt, repayNotes);
    setRepayLoan(null);
    setRepayAmount("");
    setRepayNotes("");
  };

  return (
    <div className="min-h-full">
      <Topbar
        title="Debts & Liabilities"
        description="Monitor money borrowed, money lent, interest terms and repayment milestones"
        showDateRange={false}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#777B76] uppercase tracking-wider block">
                Total Liabilities (Owed by You)
              </span>
              <span className="text-2xl font-bold text-[#C65C54] tracking-tight num-tabular mt-1 block">
                {formatCurrency(totalBorrowed, preferredCurrency)}
              </span>
              <p className="text-[11px] text-[#777B76] mt-0.5">
                Outstanding balance across active borrowings
              </p>
            </div>
            <div className="p-3 bg-[#C65C54]/10 text-[#C65C54] rounded-full">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#777B76] uppercase tracking-wider block">
                Total Receivables (Lent to Others)
              </span>
              <span className="text-2xl font-bold text-[#174D3C] tracking-tight num-tabular mt-1 block">
                {formatCurrency(totalLent, preferredCurrency)}
              </span>
              <p className="text-[11px] text-[#777B76] mt-0.5">
                Outstanding capital expected back
              </p>
            </div>
            <div className="p-3 bg-[#174D3C]/10 text-[#174D3C] rounded-full">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab & Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md">
          <div className="flex items-center gap-1 bg-[#F8F7F2] p-1 border border-[#E7E6DF] rounded text-xs">
            <button
              onClick={() => setActiveTab("borrowed")}
              className={`px-3 py-1.5 font-semibold rounded transition-colors ${
                activeTab === "borrowed"
                  ? "bg-[#FFFFFF] text-[#C65C54] shadow-xs"
                  : "text-[#777B76] hover:text-[#171A18]"
              }`}
            >
              Borrowed Money (Debts)
            </button>
            <button
              onClick={() => setActiveTab("lent")}
              className={`px-3 py-1.5 font-semibold rounded transition-colors ${
                activeTab === "lent"
                  ? "bg-[#FFFFFF] text-[#174D3C] shadow-xs"
                  : "text-[#777B76] hover:text-[#171A18]"
              }`}
            >
              Lent Money (Receivables)
            </button>
          </div>

          <button
            onClick={() => {
              setType(activeTab);
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#F8F7F2] bg-[#174D3C] hover:bg-[#0E362A] rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record New Loan / Debt</span>
          </button>
        </div>

        {/* Loans Table */}
        <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md overflow-hidden">
          {displayedLoans.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={HandCoins}
                title={`No ${activeTab === "borrowed" ? "Debts" : "Receivables"} Tracked`}
                description={`You have no active or completed records of money ${activeTab}.`}
                actionText={`Record ${activeTab === "borrowed" ? "Debt" : "Loan"}`}
                onAction={() => {
                  setType(activeTab);
                  setIsAddOpen(true);
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E7E6DF] bg-[#F8F7F2]/60 text-[#777B76] font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Counterparty</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Paid / Settled</th>
                    <th className="py-3 px-4">Remaining</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E6DF]">
                  {displayedLoans.map((loan) => {
                    const remaining = Math.max(0, loan.total_amount - loan.paid_amount);
                    return (
                      <tr key={loan.id} className="hover:bg-[#F8F7F2]/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#171A18]">
                          {loan.counterparty_name}
                          {loan.interest_rate > 0 && (
                            <span className="text-[10px] text-[#777B76] block">
                              Interest: {loan.interest_rate}% p.a.
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold num-tabular text-[#171A18]">
                          {formatCurrency(loan.total_amount, preferredCurrency)}
                        </td>
                        <td className="py-3.5 px-4 num-tabular text-[#174D3C] font-medium">
                          {formatCurrency(loan.paid_amount, preferredCurrency)}
                        </td>
                        <td className="py-3.5 px-4 num-tabular font-bold text-[#171A18]">
                          {formatCurrency(remaining, preferredCurrency)}
                        </td>
                        <td className="py-3.5 px-4 text-[#777B76] num-tabular">
                          {formatDate(loan.due_date)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={loan.status === "paid_off" ? "dark" : "sage"}>
                            {loan.status === "paid_off" ? "Settled" : "Active"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {loan.status !== "paid_off" && (
                              <button
                                onClick={() => setRepayLoan(loan)}
                                className="px-2 py-1 bg-[#DCE8DE] hover:bg-[#DCE8DE]/70 text-[#174D3C] rounded text-[11px] font-medium transition-colors"
                              >
                                Record Payment
                              </button>
                            )}
                            <button
                              onClick={() => deleteLoan(loan.id)}
                              className="p-1 rounded text-[#777B76] hover:text-[#C65C54] hover:bg-[#C65C54]/10"
                              title="Delete Loan"
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

      {/* Add Loan Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Debt or Loan Agreement"
        description="Track liability terms and expected settlement"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded bg-[#C65C54]/10 border border-[#C65C54]/20 text-[#C65C54] font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Agreement Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("borrowed")}
                className={`py-2 text-xs font-semibold rounded border transition-colors ${
                  type === "borrowed"
                    ? "bg-[#C65C54]/10 border-[#C65C54] text-[#C65C54]"
                    : "bg-[#FFFFFF] border-[#E7E6DF] text-[#777B76]"
                }`}
              >
                Borrowed (You Owe)
              </button>
              <button
                type="button"
                onClick={() => setType("lent")}
                className={`py-2 text-xs font-semibold rounded border transition-colors ${
                  type === "lent"
                    ? "bg-[#174D3C]/10 border-[#174D3C] text-[#174D3C]"
                    : "bg-[#FFFFFF] border-[#E7E6DF] text-[#777B76]"
                }`}
              >
                Lent (Owed to You)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Counterparty Name / Institution *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe, Bank Loan #482"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Principal Amount ({preferredCurrency}) *
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
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="0.00"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Maturity / Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Agreement Context / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Terms, schedule or collateral notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              Save Agreement
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Repayment Modal */}
      {repayLoan && (
        <Modal
          isOpen={true}
          onClose={() => setRepayLoan(null)}
          title={`Record Repayment: ${repayLoan.counterparty_name}`}
          description={`Log a partial or full settlement towards ${formatCurrency(
            repayLoan.total_amount - repayLoan.paid_amount,
            preferredCurrency
          )} balance`}
        >
          <form onSubmit={handleRepaySubmit} className="space-y-4 text-xs">
            {repayError && (
              <div className="p-2.5 rounded bg-[#C65C54]/10 border border-[#C65C54]/20 text-[#C65C54] font-medium">
                {repayError}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Repayment Amount ({preferredCurrency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-sm font-semibold num-tabular focus:outline-none focus:border-[#174D3C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Deduct from Account (Optional Ledger Sync)
              </label>
              <select
                value={repayAccountId}
                onChange={(e) => setRepayAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              >
                <option value="">None (Do not record account transaction)</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatCurrency(a.balance, a.currency)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Repayment Note
              </label>
              <input
                type="text"
                placeholder="e.g. Installment #3, Bank reference #894"
                value={repayNotes}
                onChange={(e) => setRepayNotes(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E6DF]">
              <button
                type="button"
                onClick={() => setRepayLoan(null)}
                className="px-4 py-2 border border-[#E7E6DF] rounded text-xs text-[#777B76] hover:bg-[#F8F7F2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#174D3C] text-[#F8F7F2] rounded text-xs font-medium hover:bg-[#0E362A]"
              >
                Submit Payment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
