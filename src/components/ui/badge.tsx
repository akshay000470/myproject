import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "sage" | "gold" | "red" | "dark" | "outline";
  className?: string;
}

export function Badge({ children, variant = "sage", className }: BadgeProps) {
  const variantStyles = {
    sage: "bg-[#DCE8DE] text-[#174D3C] border border-[#174D3C]/10",
    gold: "bg-[#B69B62]/15 text-[#8C7A4E] border border-[#B69B62]/30",
    red: "bg-[#C65C54]/10 text-[#C65C54] border border-[#C65C54]/20",
    dark: "bg-[#171A18] text-[#F8F7F2]",
    outline: "bg-transparent text-[#777B76] border border-[#E7E6DF]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

