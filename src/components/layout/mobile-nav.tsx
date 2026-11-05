"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  MoreHorizontal,
  Tags,
  CalendarClock,
  Target,
  HandCoins,
  BarChart3,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { useFinance } from "@/context/finance-context";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { signOut } = useFinance();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
    { name: "Accounts", href: "/accounts", icon: Wallet },
    { name: "Budgets", href: "/budgets", icon: PiggyBank },
  ];

  const moreLinks = [
    { name: "Categories", href: "/categories", icon: Tags },
    { name: "Recurring", href: "/recurring", icon: CalendarClock },
    { name: "Savings Goals", href: "/goals", icon: Target },
    { name: "Loans & Debts", href: "/loans", icon: HandCoins },
    { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#171A18]/50 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative ml-auto w-64 max-w-[80%] bg-[#FFFFFF] h-full shadow-2xl flex flex-col z-10">
            <div className="h-16 px-6 border-b border-[#E7E6DF] flex items-center justify-between">
              <span className="text-sm font-semibold text-[#171A18]">More Sections</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded text-[#777B76] hover:bg-[#F8F7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {moreLinks.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors",
                      isActive
                        ? "bg-[#DCE8DE] text-[#174D3C] font-semibold"
                        : "text-[#777B76] hover:text-[#171A18] hover:bg-[#F8F7F2]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t border-[#E7E6DF]">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#C65C54] hover:bg-[#C65C54]/10 rounded"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-[#E7E6DF] bg-[#FFFFFF] flex items-center justify-around z-30 px-2">
        {mainLinks.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-14 py-1 gap-1 text-[10px] font-medium transition-colors",
                isActive ? "text-[#174D3C]" : "text-[#777B76]"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center w-14 py-1 gap-1 text-[10px] font-medium text-[#777B76]"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}

