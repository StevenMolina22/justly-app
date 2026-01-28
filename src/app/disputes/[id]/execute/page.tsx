"use client";

import React, { useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { useExecuteRuling } from "@/hooks/actions/useExecuteRuling";
import { useDisputeFinancials } from "@/hooks/disputes/useDisputeFinancials";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import { usePageSwipe } from "@/hooks/ui/usePageSwipe";
import { Loader2, Wallet, Trophy, Coins, Gavel, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PaginationDots } from "@/components/dispute-overview/PaginationDots";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";

export default function ExecuteRulingPage() {
  const router = useRouter();
  const params = useParams();
  const disputeId = (params?.id as string) || "1";

  const { dispute, refetch } = useGetDispute(disputeId);
  const { executeRuling, isExecuting } = useExecuteRuling();
  
  // Determine if ruling has been executed (status === 3)
  const isFinished = dispute?.status === 3;
  
  // Fetch Real Financials (only after ruling is executed)
  const { principal, reward, total, currency, isWinner, isLoading: isFinanceLoading } = useDisputeFinancials(disputeId, isFinished);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const bindSwipe = usePageSwipe({
    onSwipeRight: () => router.back(),
  });

  const handleExecute = async () => {
    if (!dispute) return;
    if (dispute.status !== 2) {
      toast.error("Dispute is not ready for execution yet.");
      return;
    }
    const success = await executeRuling(disputeId);
    if (success) {
      await refetch();
      setShowSuccess(true);
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccess(false);
    toast.info("Ruling executed. You can review any balance updates in your Profile.");
    router.push("/profile");
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen bg-[#F8F9FC] relative overflow-hidden font-manrope"
      {...bindSwipe()}
    >
      {/* 1. Header (Transparent & Clean) */}
      <DisputeOverviewHeader
        onBack={() => router.back()}
        title="Ruling Phase"
        className="pt-6"
      />

      <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col pt-4">
        {/* 2. Hero Section: The "Bag" */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-6">
            <div
              className={`w-24 h-24 rounded-[32px] flex items-center justify-center rotate-3 ${
                isFinanceLoading 
                  ? "bg-gray-100" 
                  : !isFinished
                    ? "bg-gray-100"
                    : isWinner
                      ? "bg-[#8c8fff]/10"
                      : "bg-red-50"
              }`}
            >
              {isFinanceLoading ? (
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
              ) : !isFinished ? (
                 <Gavel className="w-10 h-10 text-gray-400" />
              ) : isWinner ? (
                <Wallet className="w-10 h-10 text-[#8c8fff]" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-400" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#1b1c23] rounded-full border-[3px] border-white flex items-center justify-center shadow-lg">
              <Coins className="w-5 h-5 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-[#1b1c23] mb-2 leading-tight">
            {isFinished ? "Ruling Executed" : "Finalize Ruling"}
          </h1>
          <p className="text-sm text-gray-500 font-medium max-w-[260px]">
             {!isFinished
                ? "Execute the ruling to finalize the dispute and see your results."
                : isFinanceLoading
                  ? "Calculating results..."
                  : isWinner
                    ? "You voted with the majority. Your rewards have been added to your profile."
                    : "The majority voted differently. You will not receive a reward for this dispute."}
          </p>
        </div>

        {/* 3. The "Receipt" Card */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-500">
          {/* Dispute Context */}
          <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
            {/* Changed Icon to Purple to signify 'Victory/Completion' */}
            <div className="w-10 h-10 rounded-xl bg-[#8c8fff]/10 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-[#8c8fff]" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="font-semibold text-gray-800 truncate">
                {dispute ? dispute.title : "Loading Case..."}
              </h3>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">
                Case #{disputeId}
              </p>
            </div>
          </div>

          {/* Financial Breakdown */}
          {!isFinished ? (
             <div className="flex justify-center py-4 text-sm text-gray-400">
               Execute the ruling to see financial breakdown
             </div>
          ) : isFinanceLoading ? (
             <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-300" /></div>
          ) : (
            <div className="flex flex-col gap-3">
              <RewardRow
                label="Staked Principal"
                value={`${principal} ${currency}`}
                icon={<div className={`w-1.5 h-1.5 rounded-full ${isWinner ? "bg-gray-300" : "bg-red-300"}`} />}
                strikethrough={!isWinner}
              />

              <RewardRow
                label="Arbitration Reward"
                value={`${isWinner ? "+" : ""}${reward} ${currency}`}
                isHighlight={isWinner}
                icon={<div className={`w-1.5 h-1.5 rounded-full ${isWinner ? "bg-[#8c8fff]" : "bg-gray-200"}`} />}
              />
            </div>
          )}

          {/* Total Section */}
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                Total Payout
              </span>
              <span className="text-[10px] font-medium text-[#8c8fff]">
                Principal + Rewards
              </span>
            </div>
            <span className={`text-xl font-extrabold ${!isFinished ? "text-gray-300" : isWinner ? "text-[#1b1c23]" : "text-gray-300"}`}>
              {!isFinished ? "—" : isFinanceLoading ? "..." : `${total} ${currency}`}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-20 pb-8">
        <div className="max-w-sm mx-auto flex flex-col gap-4">
          {/* Step Dots (Optional context) */}
          <div className="flex justify-center mb-2">
            <PaginationDots currentIndex={3} total={4} />
          </div>

          {isFinished ? (
            <button
              onClick={() => router.push("/profile")}
              className="w-full py-4 px-6 bg-[#1b1c23] border border-gray-200 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-[#2c2d33] transition-all flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Go to Profile</span>
            </button>
          ) : (
            <button
              onClick={() => void handleExecute()}
              disabled={isExecuting || !dispute || dispute.status !== 2}
              className={`
                 w-full py-4 px-6 rounded-2xl font-semibold tracking-wide transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(140,143,255,0.4)]
                 flex items-center justify-center gap-2
                 ${
                   isExecuting
                     ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                     : "bg-[#1b1c23] text-white hover:scale-[1.02] active:scale-[0.98]"
                 }
               `}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <Gavel className="w-4 h-4" />
                  <span>EXECUTE RULING</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showSuccess && <SuccessAnimation onComplete={handleAnimationComplete} />}
    </div>
  );
}

// --- Helper Component for the "Receipt" ---
const RewardRow = ({
  label,
  value,
  icon,
  isHighlight = false,
  strikethrough = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  isHighlight?: boolean;
  strikethrough?: boolean;
}) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-2.5">
      {icon}
      <span className="font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
        {label}
      </span>
    </div>
    <span
      className={`font-semibold ${isHighlight ? "text-[#8c8fff]" : "text-[#1b1c23]"} ${strikethrough ? "line-through text-gray-300" : ""}`}
    >
      {value}
    </span>
  </div>
);