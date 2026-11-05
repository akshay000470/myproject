"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Plus, Database, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";

interface TopbarProps {
  title: string;
  description?: string;
  onOpenAddTransaction?: () => void;
  showDateRange?: boolean;
}

export function Topbar({
  title,
  description,
  onOpenAddTransaction,
  showDateRange = true,
}: TopbarProps) {
  const { selectedRange, setSelectedRange, isConfigured } = useFinance();
  const [showConfigModal, setShowConfigModal] = useState(false);

  return (
    <>
      {/* Top Banner if Supabase is unconfigured */}
      {!isConfigured && (
        <div className="bg-[#B69B62]/15 border-b border-[#B69B62]/30 px-4 py-2 flex items-center justify-between text-xs text-[#8C7A4E]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#B69B62]" />
            <span>
              <strong>Local Sandbox Active:</strong> Supabase credentials not detected in <code className="bg-[#FFFFFF]/70 px-1 py-0.5 rounded text-[11px]">.env.local</code>. Real interactive data is saved locally.
            </span>
          </div>
          <button
            onClick={() => setShowConfigModal(true)}
            className="underline font-medium hover:text-[#171A18] text-xs shrink-0 ml-4 flex items-center gap-1"
          >
            Connect Supabase <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Bar */}
      <header className="h-16 px-6 border-b border-[#E7E6DF] bg-[#FFFFFF] flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-base font-semibold text-[#171A18] tracking-tight">{title}</h1>
          {description && (
            <p className="text-xs text-[#777B76] hidden sm:block">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showDateRange && (
            <div className="hidden sm:flex items-center bg-[#F8F7F2] border border-[#E7E6DF] rounded p-0.5">
              {(
                [
                  { label: "This Week", value: "this_week" },
                  { label: "This Month", value: "this_month" },
                  { label: "Last Month", value: "last_month" },
                  { label: "Last 3 Mo", value: "last_3_months" },
                  { label: "This Year", value: "this_year" },
                  { label: "All", value: "all" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedRange(opt.value)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    selectedRange === opt.value
                      ? "bg-[#FFFFFF] text-[#174D3C] shadow-xs font-semibold"
                      : "text-[#777B76] hover:text-[#171A18]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {onOpenAddTransaction && (
            <button
              onClick={onOpenAddTransaction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F8F7F2] bg-[#174D3C] hover:bg-[#0E362A] rounded transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Transaction</span>
            </button>
          )}
        </div>
      </header>

      {/* Database Connection Instructions Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Supabase Database Configuration"
        description="Connect your PostgreSQL instance for production authentication and sync"
      >
        <div className="space-y-4 text-xs text-[#171A18]">
          <p className="leading-relaxed">
            Your application comes pre-equipped with full Row Level Security (RLS) migrations and Supabase SSR integration.
          </p>

          <div className="border border-[#E7E6DF] rounded bg-[#F8F7F2] p-3 space-y-2">
            <h4 className="font-semibold text-[#174D3C] flex items-center gap-1.5">
              <Database className="w-4 h-4" /> 1. Execute SQL Migration
            </h4>
            <p className="text-[#777B76]">
              Copy the contents of <code className="bg-[#FFFFFF] px-1 py-0.5 rounded border border-[#E7E6DF]">supabase/migrations/20261105_init_schema.sql</code> and run it in your <strong>Supabase SQL Editor</strong>.
            </p>
          </div>

          <div className="border border-[#E7E6DF] rounded bg-[#F8F7F2] p-3 space-y-2">
            <h4 className="font-semibold text-[#174D3C]">2. Add Environment Variables</h4>
            <p className="text-[#777B76]">
              Paste your project credentials into <code className="bg-[#FFFFFF] px-1 py-0.5 rounded border border-[#E7E6DF]">.env.local</code>:
            </p>
            <pre className="p-2.5 bg-[#171A18] text-[#F8F7F2] rounded text-[11px] overflow-x-auto">
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
            </pre>
          </div>

          <p className="text-[#777B76] text-[11px]">
            Once populated, restart your Next.js development server. The application will automatically detect your credentials and switch to live cloud database mode.
          </p>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowConfigModal(false)}
              className="px-4 py-2 bg-[#174D3C] text-[#F8F7F2] rounded font-medium hover:bg-[#0E362A]"
            >
              Understood
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
