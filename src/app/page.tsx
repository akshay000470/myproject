"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinance } from "@/context/finance-context";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useFinance();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F2]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#174D3C] flex items-center justify-center text-[#F8F7F2] font-semibold text-xs">
          AF
        </div>
        <span className="text-xs text-[#777B76]">Initializing Antigravity Financial Suite...</span>
      </div>
    </div>
  );
}
