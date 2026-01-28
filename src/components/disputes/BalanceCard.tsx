"use client";

import React from "react";
import { useTokenBalance } from "@/hooks/core/useTokenBalance";
import { useNativeBalance } from "@/hooks/core/useNativeBalance";
import { useStakingToken } from "@/hooks/core/useStakingToken";
import { Wallet, Fuel, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import { useFaucet } from "@/hooks/actions/useFaucet";

export const BalanceCard = () => {
  const { formatted: usdcBalance, loading: loadingUSDC } = useTokenBalance();
  const { symbol: usdcSymbol } = useStakingToken();
  const { formatted: ethBalance, isLowGas, isZeroGas, symbol: ethSymbol } = useNativeBalance();
  
  const { mint } = useFaucet(); 

  const handleGasClick = () => {
    if (isLowGas || isZeroGas) {
      toast.warning(`Low Gas Warning: You have ${ethBalance} ${ethSymbol}. You need ETH to pay for transaction fees.`);
    } else {
      toast.info(`Gas Level Good: ${ethBalance} ${ethSymbol} available for fees.`);
    }
  };

  return (
    <div className="px-5 py-4">
      <div className="w-full bg-[#1b1c23] rounded-[24px] p-6 text-white shadow-xl shadow-gray-200 relative overflow-hidden group">
        
        {/* Decorative Background Blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#8c8fff] rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity" />

        <div className="relative z-10 flex flex-col gap-6">
          
          {/* Row 1: Main Staking Balance (USDC) */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1 text-gray-400">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Available Stake</span>
              </div>
              <div className="flex items-baseline gap-1">
                <h2 className="text-3xl font-manrope font-black tracking-tight">
                  {loadingUSDC ? "..." : Math.floor(Number(usdcBalance))}
                  <span className="text-lg text-gray-400 font-bold">.{(usdcBalance.split('.')[1] || '').slice(0, 2).padEnd(2, '0')}</span>
                </h2>
                <span className="text-sm font-bold text-[#8c8fff]">{usdcSymbol}</span>
              </div>
            </div>

            {/* Quick Action: Mint/Add Funds */}
            <button 
              onClick={mint}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/5"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Row 2: Gas Indicator (The Non-Invasive Warning) */}
          <div 
            onClick={handleGasClick}
            className={`
              flex items-center gap-2 py-2 px-3 rounded-xl w-fit cursor-pointer transition-all border
              ${(isLowGas || isZeroGas) 
                ? "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20" 
                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
              }
            `}
          >
            {/* Dynamic Icon */}
            {(isLowGas || isZeroGas) ? (
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <Fuel className="w-3.5 h-3.5" />
            )}

            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                {(isLowGas || isZeroGas) ? "Low Gas" : "Gas Level"}
              </span>
            </div>

            {/* Balance Value */}
            <span className="text-xs font-mono font-medium ml-1">
              {ethBalance} {ethSymbol}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
