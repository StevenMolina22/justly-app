"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SelectAmount } from "@/components/SelectAmount";
import { SwipeButton } from "@/components/SwipeButton";
import { AlertCircle } from "lucide-react";
import { FinancialProjection } from "@/components/juror/FinancialProjection";
import { useHeader } from "@/lib/hooks/useHeader";

export default function JurorStakePage() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number>(5);

  // Configure header (no title for minimal look)
  useHeader({
    title: undefined,
  });

  const handleSwipeComplete = () => {
    router.push(`/juror/assign?amount=${selectedAmount.toString()}`);
  };

  return (
    <div className="flex flex-col flex-1 relative">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center px-5 py-4 overflow-y-auto">
        {/* SINGLE UNIFIED CARD */}
        <div className="w-full bg-white rounded-4xl p-6 shadow-[0px_20px_40px_-10px_rgba(27,28,35,0.05)] border border-gray-200 relative overflow-hidden">
          {/* Ambient Background Glow (Justice Purple) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-75 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#8c8fff]/10 via-transparent to-transparent pointer-events-none opacity-60" />

          {/* 1. Header & Animation */}
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Animation Container */}
            <div className="w-20 h-20 my-2 relative">
              <div className="absolute inset-0 bg-[#8c8fff]/20 rounded-full blur-2xl scale-75" />
              <video
                src="/animations/money.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain relative z-10"
              />
            </div>

            <h1 className="text-2xl font-extrabold text-[#1b1c23] mb-2 font-manrope tracking-tight">
              Choose your stake
            </h1>

            <p className="text-gray-600 font-medium mb-8 max-w-65 text-center leading-relaxed">
              Higher stakes unlock higher-value disputes.
            </p>

            {/* SLIDER SECTION */}
            {/* Added px-4 here to ensure the labels ($1 / $20) don't get cut off by the card edges */}
            <div className="w-full px-2 sm:px-4">
              <SelectAmount
                selectedAmount={selectedAmount}
                onAmountChange={setSelectedAmount}
              />
            </div>
          </div>

          {/* 2. Financial Metrics (Integrated Block) */}
          <FinancialProjection stakeAmount={selectedAmount} />

          {/* 3. Risk Warning (Integrated Footer) */}
          <div className="mt-6 pt-5 border-t border-dashed border-gray-200">
            <div className="flex gap-3 items-start">
              <div className="shrink-0 mt-0.5 text-gray-300">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-medium text-gray-600 leading-relaxed">
                <span className="text-[#1b1c23] font-bold">Risk Warning:</span>{" "}
                Staked funds are locked during the dispute. Incoherent votes
                result in slashing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="px-5 pb-8 pt-2 flex justify-center shrink-0 z-20">
        <SwipeButton onSwipeComplete={handleSwipeComplete}>
          <span className="font-bold ">Join Jury</span>
        </SwipeButton>
      </div>
    </div>
  );
}
