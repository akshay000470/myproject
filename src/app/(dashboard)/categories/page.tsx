"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Topbar } from "@/components/layout/topbar";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Category, CategoryType } from "@/types/database";
import { Tags, Plus, Trash2, CheckCircle2 } from "lucide-react";

export default function CategoriesPage() {
  const { categories, addCategory, deleteCategory } = useFinance();

  const [activeTab, setActiveTab] = useState<CategoryType>("expense");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("expense");
  const [color, setColor] = useState("#174D3C");
  const [error, setError] = useState<string | null>(null);

  const displayedCategories = categories.filter((c) => c.type === activeTab);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please specify a category title.");
      return;
    }

    await addCategory({
      name: name.trim(),
      type,
      color,
      icon: "tag",
      is_default: false,
    });

    setName("");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-full">
      <Topbar
        title="Category Taxonomy"
        description="Organize income sources and living expenditure classifications"
        showDateRange={false}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Tabs & Add Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#FFFFFF] border border-[#E7E6DF] rounded-md">
          <div className="flex items-center gap-1 bg-[#F8F7F2] p-1 border border-[#E7E6DF] rounded text-xs">
            <button
              onClick={() => setActiveTab("expense")}
              className={`px-3 py-1.5 font-semibold rounded transition-colors ${
                activeTab === "expense"
                  ? "bg-[#FFFFFF] text-[#C65C54] shadow-xs"
                  : "text-[#777B76] hover:text-[#171A18]"
              }`}
            >
              Expense Categories ({categories.filter((c) => c.type === "expense").length})
            </button>
            <button
              onClick={() => setActiveTab("income")}
              className={`px-3 py-1.5 font-semibold rounded transition-colors ${
                activeTab === "income"
                  ? "bg-[#FFFFFF] text-[#174D3C] shadow-xs"
                  : "text-[#777B76] hover:text-[#171A18]"
              }`}
            >
              Income Categories ({categories.filter((c) => c.type === "income").length})
            </button>
          </div>

          <button
            onClick={() => {
              setType(activeTab);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#F8F7F2] bg-[#174D3C] hover:bg-[#0E362A] rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Category</span>
          </button>
        </div>

        {/* Categories Grid */}
        {displayedCategories.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No Categories Available"
            description="Create custom categories to accurately classify your financial flows."
            actionText="Add Category"
            onAction={() => {
              setType(activeTab);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedCategories.map((c) => (
              <div
                key={c.id}
                className="bg-[#FFFFFF] border border-[#E7E6DF] rounded p-4 flex items-center justify-between hover:border-[#174D3C]/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: c.color || (c.type === "expense" ? "#C65C54" : "#174D3C") }}
                  />
                  <div className="truncate">
                    <span className="text-xs font-semibold text-[#171A18] block truncate">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-[#777B76]">
                      {c.is_default ? "System Default" : "Custom Category"}
                    </span>
                  </div>
                </div>

                {!c.is_default ? (
                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="p-1 rounded text-[#777B76] hover:text-[#C65C54] hover:bg-[#C65C54]/10 transition-colors ml-2"
                    title="Delete Custom Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#174D3C]/40 ml-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Custom Category"
        description="Expand your financial classification hierarchy"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded bg-[#C65C54]/10 border border-[#C65C54]/20 text-[#C65C54] font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Category Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gym & Fitness, Software Tools"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Category Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CategoryType)}
                className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                Visual Badge Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-8 p-0.5 border border-[#E7E6DF] rounded bg-[#FFFFFF] cursor-pointer"
              />
            </div>
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
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
