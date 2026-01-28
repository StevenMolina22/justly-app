"use client";

import React from "react";
import { TrendingUp, Info } from "lucide-react";

interface Props {
  stakeAmount: number;
}

export const FinancialProjection = ({ stakeAmount }: Props) => {
  // --- LOGIC: The "Standard Case" Assumption ---
  // In Slice V1.1, rewards come from the losing jurors' staked pool.
  // Scenario: 3 Jurors total. 2 vote correctly (Winner), 1 votes incorrectly (Loser).
  // Total Losing Pool = 1 * Stake
  // My Share of Winning Pool = 50% (since I am 1 of 2 winners)
  // Reward = 50% of Losing Pool = 0.5 * Stake
  // Total Payout = Principal + Reward = 1.5 * Stake
  const roiPercentage = 50; 
  const profit = stakeAmount * 0.5;
  const totalPayout = stakeAmount + profit;

  if (stakeAmount <= 0) return null;

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-emerald-50 rounded-lg">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          If you rule correctly
        </span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#1b1c23]">
              {totalPayout.toFixed(0)}
            </span>
            <span className="text-sm font-bold text-gray-400">USDC</span>
          </div>
          <p className="text-[11px] font-medium text-emerald-600 mt-1">
            +{profit.toFixed(0)} USDC Profit
          </p>
        </div>

        <div className="text-right">
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-black">
            +{roiPercentage}% ROI
          </div>
        </div>
      </div>

      {/* Subtle Disclaimer */}
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-start gap-1.5">
        <Info className="w-3 h-3 text-gray-300 mt-0.5 shrink-0" />
        <p className="text-[10px] text-gray-400 leading-tight">
          Based on a standard 3-juror dispute with a 2-1 vote split. 
          If you vote against the majority, you may lose your stake.
        </p>
      </div>
    </div>
  );
};
