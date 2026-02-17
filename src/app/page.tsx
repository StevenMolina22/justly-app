"use client";

import { BalanceCard } from "@/components/disputes/BalanceCard";
import { DisputesList } from "@/components/disputes/DisputesList";
import { Scale, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DisputesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header is now handled by AppShell via TopNavigation */}

      <div className="px-5">
        <BalanceCard />
      </div>

      {/* Section Header */}
      <div className="px-5 pb-3 pt-5">
        <div className="flex items-center gap-2 mb-1">
          <Scale className="w-4 h-4 text-[#8c8fff]" />
          <h3 className="text-base font-bold text-[#1b1c23]">
            Explore Disputes
          </h3>
        </div>
      </div>

      {/* Public Disputes Feed */}
      <DisputesList mode="all" />
      <button
        onClick={() => router.push("/juror/stake")}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 group"
      >
        <div
          className="
          relative flex items-center gap-3 px-6 py-3.5
          bg-[#8c8fff] rounded-full
          border border-[#7a7de6]
          shadow-[0_10px_40px_-10px_rgba(27,28,35,0.4)]
          hover:shadow-[0_20px_40px_-10px_rgba(140,143,255,0.3)]
          hover:-translate-y-1 active:scale-95
          transition-all duration-300 ease-out
        "
        >
          {/* Animated Gradient Background Effect (Optional subtle shine) */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>

          {/* Icon - Switched to Brand Purple or Money Green based on preference */}
          <Sparkles className="w-4 h-4 font-bold text-[#1b1c23] " />

          {/* Text - Single Line, Bold, Clean */}
          <span className="text-[#1b1c23] font-manrope font-bold tracking-wide pr-1">
            Start Earning
          </span>
        </div>
      </button>
    </div>
  );
}
