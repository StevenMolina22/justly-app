"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisputeOverviewHeaderProps {
  onBack?: () => void;
  title?: React.ReactNode;
  className?: string;
  children?: React.ReactNode; // Allows injecting content below the nav row (e.g. CategorySelector)
  rightElement?: React.ReactNode; // Allows overriding the Home button
  showBack?: boolean;
}

export const DisputeOverviewHeader: React.FC<DisputeOverviewHeaderProps> = ({
  onBack,
  title,
  className,
  children,
  rightElement,
  showBack = true,
}) => {
  const router = useRouter();

  const handleBack = onBack || (() => router.back());

  return (
    // Removed: absolute, top-0, left-0, right-0, z-50
    // Added: flex-none (prevents shrinking in flex container)
    <div
      className={cn(
        "w-full py-6 px-6 flex flex-col gap-6 bg-background/90 backdrop-blur-md flex-none z-10 transition-colors duration-300",
        className,
      )}
    >
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between w-full relative">
        {showBack ? (
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm text-[#1b1c23]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10 h-10" /> // Spacer to keep title centered
        )}

        {title && (
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
            {title}
          </span>
        )}

        {rightElement ? (
          rightElement
        ) : (
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm text-[#1b1c23]"
          >
            <Home className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Optional Children (e.g. Dropdowns, Filters) */}
      {children && <div className="w-full flex justify-center">{children}</div>}
    </div>
  );
};
