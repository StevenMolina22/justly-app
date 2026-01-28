"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

interface Props {
  stakeAmount: number;
}

export const FinancialProjection = ({ stakeAmount }: Props) => {
  // --- LOGIC ---
  const REWARD_MULTIPLIER = 0.5;
  const roiPercentage = REWARD_MULTIPLIER * 100;
  const profit = stakeAmount * REWARD_MULTIPLIER;

  if (stakeAmount <= 0) return null;

  return (
    <div className="w-full bg-[#f2f4f9] rounded-[20px] p-5 animate-in fade-in slide-in-from-bottom-2">
      {/* Header Label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-[#8c8fff]/10 rounded-lg">
          <TrendingUp className="w-3.5 h-3.5 text-[#8c8fff]" />
        </div>
        <span className="text-[10px] font-extrabold text-gray-600 uppercase tracking-widest">
          Projected Return
        </span>
      </div>

      {/* Main Stats Row */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-[#1b1c23] tracking-tighter">
              {stakeAmount}
            </span>
            <span className="font-semibold text-gray-800">USDC</span>
          </div>

          {/* Profit Pill */}
          <div className="mt-1">
            <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              +{profit.toFixed(0)} Profit
            </span>
          </div>
        </div>

        {/* ROI Badge (Purple) */}
        <div className="text-right pb-1">
          <div className="bg-[#8c8fff] text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-[#8c8fff]/20 tracking-wide">
            +{roiPercentage}% ROI
          </div>
        </div>
      </div>
    </div>
  );
};
