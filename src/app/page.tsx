"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFinance } from "@/context/finance-context";
import { ArrowRight, ShieldCheck, Wallet, ArrowLeftRight, PiggyBank } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useFinance();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8F7F2] text-[#171A18]">
      <header className="h-16 px-6 border-b border-[#E7E6DF] bg-[#FFFFFF] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#174D3C] flex items-center justify-center text-[#F8F7F2] font-semibold text-sm shadow-xs">
            AF
          </div>
          <span className="text-sm font-semibold tracking-tight text-[#171A18]">
            ANTIGRAVITY FINANCIAL
          </span>
        </div>
        <Link
          href="/login"
          className="px-4 py-2 bg-[#174D3C] hover:bg-[#0E362A] text-[#F8F7F2] text-xs font-semibold rounded transition-colors shadow-xs"
        >
          Access Vault
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DCE8DE] border border-[#174D3C]/10 rounded-full text-xs font-medium text-[#174D3C]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enterprise Personal Wealth & Ledger Management</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171A18]">
            Sophisticated Financial Management for Serious Wealth
          </h1>

          <p className="text-xs sm:text-sm text-[#777B76] max-w-lg mx-auto leading-relaxed">
            Track daily cashflow across multi-currency accounts, set strict monthly budget ceilings, monitor debt terms, and schedule automated commitments with zero dummy data.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-[#174D3C] hover:bg-[#0E362A] text-[#F8F7F2] text-xs font-semibold rounded flex items-center gap-2 transition-colors shadow-xs"
            >
              <span>Enter Financial Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-[#FFFFFF] border border-[#E7E6DF] hover:bg-[#F8F7F2] text-[#171A18] text-xs font-semibold rounded transition-colors"
            >
              Register New Vault
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-8 border-t border-[#E7E6DF] text-left">
            <div className="p-4 bg-[#FFFFFF] border border-[#E7E6DF] rounded">
              <Wallet className="w-4 h-4 text-[#174D3C] mb-2" />
              <h4 className="text-xs font-semibold text-[#171A18]">Multi-Account Portfolios</h4>
              <p className="text-[11px] text-[#777B76] mt-1">Savings, current, credit cards, and cash wallets.</p>
            </div>
            <div className="p-4 bg-[#FFFFFF] border border-[#E7E6DF] rounded">
              <ArrowLeftRight className="w-4 h-4 text-[#174D3C] mb-2" />
              <h4 className="text-xs font-semibold text-[#171A18]">Atomic Transfers</h4>
              <p className="text-[11px] text-[#777B76] mt-1">Inter-account fund movement with transactional consistency.</p>
            </div>
            <div className="p-4 bg-[#FFFFFF] border border-[#E7E6DF] rounded">
              <PiggyBank className="w-4 h-4 text-[#174D3C] mb-2" />
              <h4 className="text-xs font-semibold text-[#171A18]">Budget Ceilings</h4>
              <p className="text-[11px] text-[#777B76] mt-1">Real-time spend tracking and overspend warnings.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-12 border-t border-[#E7E6DF] bg-[#FFFFFF] px-6 flex items-center justify-between text-[11px] text-[#777B76]">
        <span>© 2026 Antigravity Financial Technologies. All rights reserved.</span>
        <span>Secure PostgreSQL & Supabase Architecture</span>
      </footer>
    </div>
  );
}
