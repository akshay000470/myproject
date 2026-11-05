import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#E7E6DF] bg-[#FFFFFF]/60 rounded-md my-4">
      <div className="w-12 h-12 rounded-full bg-[#DCE8DE]/40 border border-[#174D3C]/10 flex items-center justify-center text-[#174D3C] mb-4">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#171A18] tracking-tight">{title}</h3>
      <p className="text-xs text-[#777B76] max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2 text-xs font-medium text-[#F8F7F2] bg-[#174D3C] hover:bg-[#0E362A] rounded transition-colors shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
