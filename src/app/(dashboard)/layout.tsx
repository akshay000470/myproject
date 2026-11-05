"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useFinance } from "@/context/finance-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useFinance();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#174D3C] animate-pulse flex items-center justify-center text-[#F8F7F2] font-semibold text-xs">
            AF
          </div>
          <span className="text-xs text-[#777B76] font-medium tracking-wide">
            Authenticating Financial Vault...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#F8F7F2]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <main className="flex-1">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
