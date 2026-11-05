"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "@/context/finance-context";
import { Topbar } from "@/components/layout/topbar";
import { AddTransactionModal } from "@/components/modals/add-transaction-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Transaction } from "@/types/database";
import {
  Receipt,
  Search,
  Download,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function TransactionsPage() {
  const {
    transactions,
    accounts,
    categories,
    deleteTransaction,
    updateTransaction,
    preferredCurrency,
  } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<Transaction | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter & Sort Logic
  const filteredList = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search
        if (
          searchTerm &&
          !t.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
        ) {
          return false;
        }
        // Type
        if (typeFilter !== "all" && t.type !== typeFilter) return false;
        // Account
        if (accountFilter !== "all" && t.account_id !== accountFilter) return false;
        // Category
        if (categoryFilter !== "all" && t.category_id !== categoryFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date_desc") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === "date_asc") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === "amount_desc") {
          return Number(b.amount) - Number(a.amount);
        }
        if (sortBy === "amount_asc") {
          return Number(a.amount) - Number(b.amount);
        }
        return 0;
      });
  }, [transactions, searchTerm, typeFilter, accountFilter, categoryFilter, sortBy]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredList.length === 0) return;
    const headers = ["Date", "Title", "Type", "Account", "Category", "Payment Method", "Amount", "Description"];
    const rows = filteredList.map((t) => {
      const acc = accounts.find((a) => a.id === t.account_id)?.name || "";
      const cat = categories.find((c) => c.id === t.category_id)?.name || "";
      return [
        t.date,
        `"${t.title.replace(/"/g, '""')}"`,
        t.type,
        `"${acc.replace(/"/g, '""')}"`,
        `"${cat.replace(/"/g, '""')}"`,
        `"${t.payment_method.replace(/"/g, '""')}"`,
        t.amount,
        `"${(t.description || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financial_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    await updateTransaction(editingTx.id, {
      title: editingTx.title,
      amount: Number(editingTx.amount),
      date: editingTx.date,
      payment_method: editingTx.payment_method,
      category_id: editingTx.category_id,
      description: editingTx.description,
    });
    setEditingTx(null);
  };

  return (
    <div className="min-h-full">
      <Topbar
        title="Transaction Ledger"
        description="Comprehensive audit of all income, expense and transfer operations"
        onOpenAddTransaction={() => setIsAddOpen(true)}
      />

      <div className="p-6 space-y-5 max-w-7xl mx-auto">
        {/* Filter & Control Bar */}
        <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#777B76] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-[#E7E6DF] rounded bg-[#F8F7F2]/50 text-xs focus:outline-none focus:border-[#174D3C]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
              <option value="transfer">Transfers Only</option>
            </select>

            {/* Account */}
            <select
              value={accountFilter}
              onChange={(e) => {
                setAccountFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            >
              <option value="all">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            >
              <option value="date_desc">Newest Date</option>
              <option value="date_asc">Oldest Date</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              disabled={filteredList.length === 0}
              className="px-3 py-1.5 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-[#171A18] hover:bg-[#F8F7F2] font-medium flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md overflow-hidden">
          {filteredList.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Receipt}
                title="No Transactions Found"
                description={
                  searchTerm || typeFilter !== "all" || accountFilter !== "all"
                    ? "No transactions match your current search or filter parameters."
                    : "Your financial ledger is currently empty. Record your first transaction."
                }
                actionText="Record Transaction"
                onAction={() => setIsAddOpen(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E7E6DF] bg-[#F8F7F2]/60 text-[#777B76] font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Title / Note</th>
                    <th className="py-3 px-4">Account</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E6DF]">
                  {paginatedList.map((tx) => {
                    const acc = accounts.find((a) => a.id === tx.account_id);
                    const destAcc = accounts.find((a) => a.id === tx.destination_account_id);
                    const cat = categories.find((c) => c.id === tx.category_id);
                    return (
                      <tr key={tx.id} className="hover:bg-[#F8F7F2]/40 transition-colors">
                        <td className="py-3.5 px-4 text-[#777B76] font-medium num-tabular">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#171A18]">{tx.title}</p>
                          {tx.description && (
                            <p className="text-[11px] text-[#777B76] line-clamp-1">{tx.description}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#171A18] font-medium">
                          {acc ? acc.name : "—"}
                          {tx.type === "transfer" && destAcc && (
                            <span className="text-[#777B76] block text-[10px]">
                              → {destAcc.name}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {tx.type === "transfer" ? (
                            <Badge variant="gold">Transfer</Badge>
                          ) : cat ? (
                            <Badge variant={cat.type === "expense" ? "sage" : "dark"}>
                              {cat.name}
                            </Badge>
                          ) : (
                            <span className="text-[#777B76]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#777B76]">{tx.payment_method}</td>
                        <td
                          className={`py-3.5 px-4 text-right font-bold num-tabular ${
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
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingTx(tx)}
                              className="p-1 rounded text-[#777B76] hover:text-[#171A18] hover:bg-[#E7E6DF]/50 transition-colors"
                              title="Edit Transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmTx(tx)}
                              className="p-1 rounded text-[#777B76] hover:text-[#C65C54] hover:bg-[#C65C54]/10 transition-colors"
                              title="Delete Transaction"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-[#E7E6DF] bg-[#F8F7F2]/40 flex items-center justify-between text-xs text-[#777B76]">
              <span>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredList.length)} of {filteredList.length} transactions
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded border border-[#E7E6DF] bg-[#FFFFFF] hover:bg-[#F8F7F2] disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 py-1 font-semibold text-[#171A18]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded border border-[#E7E6DF] bg-[#FFFFFF] hover:bg-[#F8F7F2] disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTx(null)}
          title="Edit Transaction"
          description="Update transaction details and adjust financial ledger records"
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">Title *</label>
              <input
                type="text"
                required
                value={editingTx.title}
                onChange={(e) => setEditingTx({ ...editingTx, title: e.target.value })}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#777B76] mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingTx.amount}
                  onChange={(e) => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-sm font-semibold num-tabular focus:outline-none focus:border-[#174D3C]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#777B76] mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={editingTx.date}
                  onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#777B76] mb-1">Category</label>
                <select
                  value={editingTx.category_id || ""}
                  onChange={(e) => setEditingTx({ ...editingTx, category_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#777B76] mb-1">Payment Method</label>
                <input
                  type="text"
                  value={editingTx.payment_method}
                  onChange={(e) => setEditingTx({ ...editingTx, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">Notes</label>
              <textarea
                rows={2}
                value={editingTx.description || ""}
                onChange={(e) => setEditingTx({ ...editingTx, description: e.target.value })}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E6DF]">
              <button
                type="button"
                onClick={() => setEditingTx(null)}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmTx && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmTx(null)}
          title="Delete Transaction"
          description="Are you sure you wish to delete this transaction from your ledger?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#171A18]">
              This will permanently remove <strong>{deleteConfirmTx.title}</strong> (
              {formatCurrency(deleteConfirmTx.amount, preferredCurrency)}) and revert its effect on your account balance.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E6DF]">
              <button
                type="button"
                onClick={() => setDeleteConfirmTx(null)}
                className="px-4 py-2 border border-[#E7E6DF] rounded text-xs text-[#777B76] hover:bg-[#F8F7F2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteTransaction(deleteConfirmTx.id);
                  setDeleteConfirmTx(null);
                }}
                className="px-4 py-2 bg-[#C65C54] text-[#F8F7F2] rounded text-xs font-medium hover:bg-[#A8453E]"
              >
                Delete Record
              </button>
            </div>
          </div>
        </Modal>
      )}

      <AddTransactionModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
