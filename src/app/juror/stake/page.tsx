"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SelectAmount } from "@/components/category-amount/SelectAmount";
import { SwipeButton } from "@/components/category-amount/SwipeButton";
import { AlertCircle } from "lucide-react";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { FinancialProjection } from "@/components/juror/FinancialProjection";

export default function JurorStakePage() {
  const router = useRouter();
  // Default to 5 USDC (middle left option)
  const [selectedAmount, setSelectedAmount] = useState<number>(5);

  const handleSwipeComplete = () => {
    // Pass the selected integer amount (e.g., "50") to the assign page.
    // The useAssignDispute hook will parse this string into USDC units (6 decimals).
    router.push(`/juror/assign?amount=${selectedAmount.toString()}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FC]">
      <DisputeOverviewHeader onBack={() => router.back()} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center px-5 py-4 gap-4 overflow-y-auto">
        {/* 2. Main Stake Card */}
        <div className="w-full bg-white rounded-[32px] p-6 shadow-[0px_8px_30px_rgba(0,0,0,0.04)] border border-white flex flex-col items-center justify-center text-center relative overflow-visible">
          {/* Ambient Background Glow */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Animation */}
            <div className="w-[100px] h-[100px] my-4 relative">
              <div className="absolute inset-0 bg-[#8c8fff]/10 rounded-full blur-xl scale-90" />
              <video
                src="/animations/money.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain relative z-10 drop-shadow-sm"
              />
            </div>

            <h1 className="text-2xl font-extrabold text-[#1b1c23] mb-2 font-manrope tracking-tight">
              Choose your stake
            </h1>

            <p className="text-gray-400 text-sm font-medium mb-6 max-w-[260px] leading-relaxed">
              Higher stakes allow you to join higher-value disputes.
            </p>

            <div className="w-full">
              <SelectAmount
                selectedAmount={selectedAmount}
                onAmountChange={setSelectedAmount}
              />
            </div>
          </div>
        </div>

        {/* 2. NEW: Financial Metrics Card */}
        <FinancialProjection stakeAmount={selectedAmount} />

        {/* 3. Warning / Info Card */}
        <div className="bg-[#F5F6F9] rounded-[20px] p-4 flex items-start gap-3 border border-[#EAECEF]">
          <div className="shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#8c8fff]">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-gray-500 leading-[1.5] mt-0.5 text-left">
            <span className="text-[#1b1c23]">Risk Warning:</span> Staked funds are locked during the dispute. 
            Incoherent votes result in loss of stake.
          </p>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="px-5 pb-8 flex justify-center shrink-0 z-20">
        <SwipeButton onSwipeComplete={handleSwipeComplete}>
          <span className="font-bold">Stake & Find Disputes</span>
        </SwipeButton>
      </div>
    </div>
  );
}
