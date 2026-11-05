"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useFinance } from "@/context/finance-context";
import { TransactionType } from "@/types/database";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { accounts, categories, addTransaction, transferFunds, preferredCurrency } = useFinance();

  const [type, setType] = useState<TransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [destinationAccountId, setDestinationAccountId] = useState(accounts[1]?.id || "");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("2026-11-05");
  const [paymentMethod, setPaymentMethod] = useState("UPI / Net Banking");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Set default account & date
  React.useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
    if (accounts.length > 1 && !destinationAccountId) {
      setDestinationAccountId(accounts[1].id);
    }
  }, [accounts, accountId, destinationAccountId]);

  const availableCategories = categories.filter((c) =>
    type === "expense" ? c.type === "expense" : c.type === "income"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (accounts.length === 0) {
      setError("Please create an account first before recording transactions.");
      return;
    }

    if (!accountId) {
      setError("Please select an account.");
      return;
    }

    if (type === "transfer") {
      if (accountId === destinationAccountId) {
        setError("Source and destination accounts must be different.");
        return;
      }
      await transferFunds(accountId, destinationAccountId, parsedAmount, description);
    } else {
      await addTransaction({
        account_id: accountId,
        category_id: categoryId || null,
        title,
        amount: parsedAmount,
        type,
        date,
        payment_method: paymentMethod,
        description: description || null,
      });
    }

    // Reset and close
    setTitle("");
    setAmount("");
    setDescription("");
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Financial Transaction"
      description="Add an income, expense, or inter-account fund transfer"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded bg-[#C65C54]/10 border border-[#C65C54]/20 text-[#C65C54] font-medium">
            {error}
          </div>
        )}

        {/* Type Selector Tabs */}
        <div>
          <label className="block text-[11px] font-medium text-[#777B76] mb-1.5 uppercase tracking-wider">
            Transaction Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["expense", "income", "transfer"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                className={`py-2 text-xs font-semibold rounded border transition-colors capitalize ${
                  type === t
                    ? t === "expense"
                      ? "bg-[#C65C54]/10 border-[#C65C54] text-[#C65C54]"
                      : t === "income"
                      ? "bg-[#174D3C]/10 border-[#174D3C] text-[#174D3C]"
                      : "bg-[#B69B62]/15 border-[#B69B62] text-[#8C7A4E]"
                    : "bg-[#FFFFFF] border-[#E7E6DF] text-[#777B76] hover:bg-[#F8F7F2]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Amount & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Transaction Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grocery Store, Client Invoice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            />
          </div>
        </div>

        {/* Account Selection */}
        {type === "transfer" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                From Account *
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency} {acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                To Account *
              </label>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency} {acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Account *
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              >
                {accounts.length === 0 ? (
                  <option value="">No accounts exist</option>
                ) : (
                  accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currency} {acc.balance.toLocaleString()})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              >
                <option value="">Select Category (Optional)</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Date & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            >
              <option value="UPI / Net Banking">UPI / Net Banking</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Wire">Bank Wire</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-[11px] font-medium text-[#777B76] mb-1">
            Description or Reference Note
          </label>
          <textarea
            rows={2}
            placeholder="Add optional financial context or receipt note"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E6DF]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#E7E6DF] rounded text-xs font-medium text-[#777B76] hover:bg-[#F8F7F2]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#174D3C] text-[#F8F7F2] rounded text-xs font-medium hover:bg-[#0E362A] shadow-xs"
          >
            Save Transaction
          </button>
        </div>
      </form>
    </Modal>
  );
}
