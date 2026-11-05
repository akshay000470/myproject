"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Tags,
  CalendarClock,
  Target,
  HandCoins,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useFinance } from "@/context/finance-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Budgets", href: "/budgets", icon: PiggyBank },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Recurring", href: "/recurring", icon: CalendarClock },
  { name: "Savings Goals", href: "/goals", icon: Target },
  { name: "Loans & Debts", href: "/loans", icon: HandCoins },
  { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, profile, signOut, isConfigured } = useFinance();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#E7E6DF] bg-[#FFFFFF] h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#E7E6DF]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#174D3C] flex items-center justify-center text-[#F8F7F2] font-semibold text-sm shadow-xs">
            AF
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-[#171A18] block leading-none">
              ANTIGRAVITY
            </span>
            <span className="text-[10px] text-[#777B76] font-medium tracking-wider uppercase">
              Financial Suite
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#777B76]">
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors",
                isActive
                  ? "bg-[#DCE8DE] text-[#174D3C] font-semibold"
                  : "text-[#777B76] hover:text-[#171A18] hover:bg-[#F8F7F2]"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-[#174D3C]" : "text-[#777B76]")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Mode Status & User Profile Footer */}
      <div className="p-4 border-t border-[#E7E6DF] space-y-3 bg-[#F8F7F2]/40">
        <div className="flex items-center justify-between px-2 py-1.5 bg-[#FFFFFF] border border-[#E7E6DF] rounded text-[11px]">
          <span className="flex items-center gap-1.5 text-[#777B76]">
            <ShieldCheck className={cn("w-3.5 h-3.5", isConfigured ? "text-[#174D3C]" : "text-[#B69B62]")} />
            {isConfigured ? "Supabase Live" : "Local Sandbox"}
          </span>
          <span className={cn("w-2 h-2 rounded-full", isConfigured ? "bg-[#174D3C]" : "bg-[#B69B62]")} />
        </div>

        {user && (
          <div className="flex items-center justify-between pt-1">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-medium text-[#171A18] truncate">
                {profile?.full_name || user.full_name || user.email.split("@")[0]}
              </p>
              <p className="text-[10px] text-[#777B76] truncate">{user.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded text-[#777B76] hover:text-[#C65C54] hover:bg-[#E7E6DF]/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

