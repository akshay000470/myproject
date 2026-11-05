"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Topbar } from "@/components/layout/topbar";
import { AddAccountModal } from "@/components/modals/add-account-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Account, AccountType } from "@/types/database";
import {
  Wallet,
  Plus,
  ArrowLeftRight,
  Edit2,
  Trash2,
  CreditCard,
  Banknote,
  Building2,
} from "lucide-react";

export default function AccountsPage() {
  const {
    accounts,
    transactions,
    deleteAccount,
    updateAccount,
    transferFunds,
    netBalance,
    preferredCurrency,
  } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);
  const [deleteConfirmAcc, setDeleteConfirmAcc] = useState<Account | null>(null);

  // Transfer Modal State
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [fromAccId, setFromAccId] = useState("");
  const [toAccId, setToAccId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNotes, setTransferNotes] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);

  // Selected Account for Transaction Ledger inspection
  const [selectedAccId, setSelectedAccId] = useState<string | null>(null);

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case "savings":
      case "current":
        return Building2;
      case "credit_card":
        return CreditCard;
      case "cash":
        return Banknote;
      default:
        return Wallet;
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);

    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      setTransferError("Enter a valid transfer amount greater than 0.");
      return;
    }

    if (!fromAccId || !toAccId) {
      setTransferError("Please select both source and destination accounts.");
      return;
    }

    if (fromAccId === toAccId) {
      setTransferError("Source and destination accounts must be different.");
      return;
    }

    const sourceAcc = accounts.find((a) => a.id === fromAccId);
    if (sourceAcc && sourceAcc.balance < amt) {
      setTransferError(`Insufficient funds in ${sourceAcc.name} (Balance: ${formatCurrency(sourceAcc.balance, sourceAcc.currency)}).`);
      return;
    }

    await transferFunds(fromAccId, toAccId, amt, transferNotes);
    setIsTransferOpen(false);
    setTransferAmount("");
    setTransferNotes("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAcc) return;
    await updateAccount(editingAcc.id, {
      name: editingAcc.name,
      type: editingAcc.type,
      currency: editingAcc.currency,
    });
    setEditingAcc(null);
  };

  const accountTransactions = selectedAccId
    ? transactions.filter((t) => t.account_id === selectedAccId || t.destination_account_id === selectedAccId)
    : [];

  const activeSelectedAccount = accounts.find((a) => a.id === selectedAccId);

  return (
    <div className="min-h-full">
      <Topbar
        title="Account Portfolio"
        description="Manage cash vaults, bank checking accounts, and credit limits"
        showDateRange={false}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Top Header Summary & Quick Transfer Trigger */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md">
          <div>
            <span className="text-[11px] font-semibold text-[#777B76] uppercase tracking-wider block">
              Aggregate Net Assets
            </span>
            <span className="text-2xl font-bold text-[#171A18] tracking-tight num-tabular mt-0.5 block">
              {formatCurrency(netBalance, preferredCurrency)}
            </span>
            <p className="text-[11px] text-[#777B76] mt-0.5">
              Consolidated value across {accounts.length} active portfolio accounts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={accounts.length < 2}
              onClick={() => {
                setFromAccId(accounts[0]?.id || "");
                setToAccId(accounts[1]?.id || "");
                setIsTransferOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#171A18] bg-[#F8F7F2] border border-[#E7E6DF] hover:bg-[#E7E6DF]/50 rounded transition-colors disabled:opacity-40"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#174D3C]" />
              <span>Transfer Funds</span>
            </button>

            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#F8F7F2] bg-[#174D3C] hover:bg-[#0E362A] rounded transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Account</span>
            </button>
          </div>
        </div>

        {/* Accounts Grid */}
        {accounts.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No Financial Accounts Configured"
            description="Add your first savings account, checking account, or cash wallet to begin tracking balances and transactions."
            actionText="Create Account"
            onAction={() => setIsAddOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => {
              const Icon = getAccountIcon(acc.type);
              const isSelected = selectedAccId === acc.id;
              return (
                <div
                  key={acc.id}
                  className={`bg-[#FFFFFF] border rounded-md p-5 flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#174D3C] shadow-sm ring-1 ring-[#174D3C]"
                      : "border-[#E7E6DF] hover:border-[#174D3C]/40"
                  }`}
                  onClick={() => setSelectedAccId(isSelected ? null : acc.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-[#DCE8DE]/50 border border-[#174D3C]/10 flex items-center justify-center text-[#174D3C]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#171A18]">{acc.name}</h4>
                        <Badge variant="outline" className="capitalize text-[10px] mt-0.5">
                          {acc.type.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingAcc(acc)}
                        className="p-1 rounded text-[#777B76] hover:text-[#171A18] hover:bg-[#F8F7F2]"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmAcc(acc)}
                        className="p-1 rounded text-[#777B76] hover:text-[#C65C54] hover:bg-[#C65C54]/10"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#E7E6DF] flex items-center justify-between">
                    <span className="text-[10px] font-medium text-[#777B76] uppercase tracking-wider">
                      Current Balance
                    </span>
                    <span
                      className={`text-base font-bold num-tabular ${
                        acc.balance < 0 ? "text-[#C65C54]" : "text-[#171A18]"
                      }`}
                    >
                      {formatCurrency(acc.balance, acc.currency)}
                    </span>
                  </div>

                  <div className="mt-2 text-right">
                    <span className="text-[10px] text-[#174D3C] font-medium hover:underline">
                      {isSelected ? "Hide Activity ▲" : "View Activity ▼"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Account Activity Inspection */}
        {selectedAccId && activeSelectedAccount && (
          <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E6DF] pb-3">
              <div>
                <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
                  Ledger for {activeSelectedAccount.name}
                </h3>
                <p className="text-[11px] text-[#777B76]">
                  Showing all transactions affecting this account
                </p>
              </div>
              <button
                onClick={() => setSelectedAccId(null)}
                className="text-xs text-[#777B76] hover:text-[#171A18]"
              >
                Close View
              </button>
            </div>

            {accountTransactions.length === 0 ? (
              <p className="text-xs text-[#777B76] py-4 text-center">
                No transactions recorded for this account yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E7E6DF] text-[#777B76] font-medium text-[11px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E6DF]">
                    {accountTransactions.slice(0, 10).map((t) => (
                      <tr key={t.id} className="hover:bg-[#F8F7F2]/60">
                        <td className="py-2.5 px-3 text-[#777B76] num-tabular">{formatDate(t.date)}</td>
                        <td className="py-2.5 px-3 font-medium text-[#171A18]">{t.title}</td>
                        <td className="py-2.5 px-3 capitalize text-[#777B76]">{t.type}</td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold num-tabular ${
                            t.type === "income" ? "text-[#174D3C]" : t.type === "expense" ? "text-[#C65C54]" : "text-[#171A18]"
                          }`}
                        >
                          {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}
                          {formatCurrency(t.amount, activeSelectedAccount.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transfer Funds Modal */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Transfer Funds Between Accounts"
        description="Move money atomically between portfolio accounts"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
          {transferError && (
            <div className="p-2.5 rounded bg-[#C65C54]/10 border border-[#C65C54]/20 text-[#C65C54] font-medium">
              {transferError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Source Account (Deduct) *
              </label>
              <select
                value={fromAccId}
                onChange={(e) => setFromAccId(e.target.value)}
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
                Destination Account (Credit) *
              </label>
              <select
                value={toAccId}
                onChange={(e) => setToAccId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatCurrency(a.balance, a.currency)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Transfer Amount *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-sm font-semibold num-tabular focus:outline-none focus:border-[#174D3C]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Transfer Reference Note
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly Savings allocation, Card payoff"
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E6DF]">
            <button
              type="button"
              onClick={() => setIsTransferOpen(false)}
              className="px-4 py-2 border border-[#E7E6DF] rounded text-xs text-[#777B76] hover:bg-[#F8F7F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#174D3C] text-[#F8F7F2] rounded text-xs font-medium hover:bg-[#0E362A]"
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Account Modal */}
      {editingAcc && (
        <Modal
          isOpen={true}
          onClose={() => setEditingAcc(null)}
          title="Edit Account Details"
          description="Update account naming and classification"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Account Name *
              </label>
              <input
                type="text"
                required
                value={editingAcc.name}
                onChange={(e) => setEditingAcc({ ...editingAcc, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Account Type *
              </label>
              <select
                value={editingAcc.type}
                onChange={(e) => setEditingAcc({ ...editingAcc, type: e.target.value as AccountType })}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              >
                <option value="savings">Savings Account</option>
                <option value="current">Current Account</option>
                <option value="cash">Cash Wallet</option>
                <option value="credit_card">Credit Card</option>
                <option value="other">Other / Investment</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E6DF]">
              <button
                type="button"
                onClick={() => setEditingAcc(null)}
                className="px-4 py-2 border border-[#E7E6DF] rounded text-xs text-[#777B76] hover:bg-[#F8F7F2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#174D3C] text-[#F8F7F2] rounded text-xs font-medium hover:bg-[#0E362A]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Account Modal */}
      {deleteConfirmAcc && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmAcc(null)}
          title="Remove Account"
          description="Confirm account deletion from portfolio"
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#171A18]">
              Are you sure you want to remove <strong>{deleteConfirmAcc.name}</strong>? Its current balance is{" "}
              {formatCurrency(deleteConfirmAcc.balance, deleteConfirmAcc.currency)}.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E6DF]">
              <button
                type="button"
                onClick={() => setDeleteConfirmAcc(null)}
                className="px-4 py-2 border border-[#E7E6DF] rounded text-xs text-[#777B76] hover:bg-[#F8F7F2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteAccount(deleteConfirmAcc.id);
                  setDeleteConfirmAcc(null);
                }}
                className="px-4 py-2 bg-[#C65C54] text-[#F8F7F2] rounded text-xs font-medium hover:bg-[#A8453E]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      <AddAccountModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
