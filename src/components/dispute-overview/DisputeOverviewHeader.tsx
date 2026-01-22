"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisputeOverviewHeaderProps {
  onBack: () => void;
  title?: string;
  className?: string;
  children?: React.ReactNode; // Allows injecting content below the nav row (e.g. CategorySelector)
}

export const DisputeOverviewHeader: React.FC<DisputeOverviewHeaderProps> = ({
  onBack,
  title,
  className,
  children,
}) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        "w-full pt-9 px-6 pb-2 flex flex-col gap-6 relative z-50",
        className,
      )}
    >
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between w-full relative">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm text-[#1b1c23]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {title && (
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest absolute left-1/2 -translate-x-1/2">
            {title}
          </span>
        )}

        <button
          onClick={() => router.push("/")}
          className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm text-[#1b1c23]"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Optional Children (e.g. Dropdowns, Filters) */}
      {children && <div className="w-full flex justify-center">{children}</div>}
    </div>
  );
};
