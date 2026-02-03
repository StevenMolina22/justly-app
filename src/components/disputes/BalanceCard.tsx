"use client";

import React, { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { RefreshCw, Send, ArrowDownCircle, AlertTriangle } from "lucide-react";
import { useTokenBalance } from "@/hooks/core/useTokenBalance";
import { useNativeBalance } from "@/hooks/core/useNativeBalance";
import { useStakingToken } from "@/hooks/core/useStakingToken";
import { SendModal } from "./SendModal";
import { ReceiveModal } from "./ReceiveModal";
import { FaucetButton } from "./FaucetButton";
import { toast } from "sonner";

export const BalanceCard: React.FC = () => {
  const router = useRouter();
  const { address } = useAccount();

  // 1. Data Hooks
  const { formatted, loading: isLoading, refetch } = useTokenBalance();
  const { symbol: usdcSymbol } = useStakingToken();
  const {
    formatted: ethBalance,
    isLowGas,
    isZeroGas,
    symbol: ethSymbol,
  } = useNativeBalance();

  // 2. Modal State
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  // 3. Display Logic
  const displayBalance = useMemo(() => {
    if (isLoading) return "Loading...";
    if (!address) return "---";
    if (formatted === undefined || formatted === null) return "N/A";

    const balance = parseFloat(formatted).toFixed(2);
    // Use dynamic symbol instead of hardcoded USDC
    return `${balance} ${usdcSymbol || "USDC"}`;
  }, [address, isLoading, formatted, usdcSymbol]);

  // 4. Gas Warning Handler
  const handleGasClick = () => {
    toast.warning(
      `Low Gas Warning: You have ${ethBalance} ${ethSymbol}. You need ETH to pay for transaction fees.`,
    );
  };

  // Styles
  const actionBtnClass =
    "flex flex-col items-center gap-1 bg-none border-none text-white cursor-pointer p-0 hover:opacity-80 transition-opacity group";
  const iconClass =
    "shrink-0 block w-[42px] h-[42px] group-hover:opacity-80 transition-opacity stroke-1";

  return (
    <>
      <div className="relative bg-[#1b1c23] rounded-[21px] p-6 w-auto min-h-28 flex flex-row justify-between items-end text-white box-border shadow-xl shadow-gray-200/20">
        {/* Top Right Refresh Button */}
        <button
          onClick={() => refetch()}
          className="absolute top-3 right-4 p-2 text-white/80 hover:text-white transition-colors"
          title="Refresh Balance"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>

        {/* Left Section */}
        <div className="flex flex-col gap-3 items-start flex-1 justify-start">
          <div className="flex flex-col gap-1 w-auto mb-0">
            <div className="font-manrope font-semibold text-[13px] leading-none opacity-70 tracking-[-0.26px] text-white">
              Balance
            </div>

            <div className="flex items-center gap-3">
              <div className="font-manrope font-bold text-2xl leading-none tracking-[-0.48px] text-white">
                {displayBalance}
              </div>

              {/* Gas Warning Pill - Only shows if low gas */}
              {(isLowGas || isZeroGas) && (
                <div
                  onClick={handleGasClick}
                  className="flex items-center gap-1.5 py-1 px-2 rounded-full bg-orange-500/10 border border-orange-500/30 cursor-pointer hover:bg-orange-500/20 transition-all group"
                  title="Low ETH Balance for Gas"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">
                    Low Gas
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Row: Details + Faucet */}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => router.push("/profile")}
              className="bg-[#8c8fff] text-[#1b1c23] border-none rounded-[12.5px] px-4.5 py-2 h-7 flex items-center justify-center font-manrope font-extrabold text-xs tracking-[-0.36px] cursor-pointer hover:opacity-90 whitespace-nowrap shrink-0 transition-opacity"
            >
              Details
            </button>
            <FaucetButton />
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex gap-4 items-center shrink-0 self-end mb-1">
          <button
            className={actionBtnClass}
            onClick={() => setIsReceiveOpen(true)}
          >
            <ArrowDownCircle className={iconClass} />
            <span className="font-manrope font-semibold text-xs tracking-[-0.12px] leading-none">
              Deposit
            </span>
          </button>
          <button
            className={actionBtnClass}
            onClick={() => setIsSendOpen(true)}
          >
            <Send className={iconClass} />
            <span className="font-manrope font-semibold text-xs tracking-[-0.12px] leading-none">
              Send
            </span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {isSendOpen && (
        <SendModal isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} />
      )}

      {isReceiveOpen && (
        <ReceiveModal
          isOpen={isReceiveOpen}
          onClose={() => setIsReceiveOpen(false)}
        />
      )}
    </>
  );
};
