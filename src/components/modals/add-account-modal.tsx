"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useFinance } from "@/context/finance-context";
import { AccountType } from "@/types/database";

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAccountModal({ isOpen, onClose }: AddAccountModalProps) {
  const { addAccount, preferredCurrency } = useFinance();

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("savings");
  const [balance, setBalance] = useState("0");
  const [currency, setCurrency] = useState(preferredCurrency || "INR");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance)) {
      setError("Please enter a valid starting balance.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter an account name.");
      return;
    }

    await addAccount({
      name: name.trim(),
      type,
      balance: parsedBalance,
      currency,
      color: type === "credit_card" ? "#C65C54" : type === "cash" ? "#B69B62" : "#174D3C",
      is_archived: false,
    });

    setName("");
    setBalance("0");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Financial Account"
      description="Connect a bank account, cash wallet, or credit card"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded bg-[#C65C54]/10 border border-[#C65C54]/20 text-[#C65C54] font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-[#777B76] mb-1">
            Account Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. HDFC Salary Account, Emergency Cash"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Account Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            >
              <option value="savings">Savings Account</option>
              <option value="current">Current Account</option>
              <option value="cash">Cash Wallet</option>
              <option value="credit_card">Credit Card</option>
              <option value="other">Other / Investment</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Currency *
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="SGD">SGD (S$)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#777B76] mb-1">
            Opening Balance *
          </label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-sm font-semibold num-tabular focus:outline-none focus:border-[#174D3C]"
          />
          <p className="text-[11px] text-[#777B76] mt-1">
            Note: We never ask for or store bank credentials, passwords, PINs, or CVVs.
          </p>
        </div>

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
            Create Account
          </button>
        </div>
      </form>
    </Modal>
  );
}

