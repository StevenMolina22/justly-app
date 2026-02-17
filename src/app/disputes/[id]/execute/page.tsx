"use client";

import React, { useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { useExecuteRuling } from "@/hooks/actions/useExecuteRuling";
import { useDisputeFinancials } from "@/hooks/disputes/useDisputeFinancials";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import { usePageSwipe } from "@/hooks/ui/usePageSwipe";
import {
  Loader2,
  Wallet,
  Trophy,
  Coins,
  Gavel,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useHeader } from "@/lib/hooks/useHeader";

export default function ExecuteRulingPage() {
  const router = useRouter();
  const params = useParams();
  const disputeId = (params?.id as string) || "1";

  const { dispute, refetch } = useGetDispute(disputeId);
  const { executeRuling, isExecuting } = useExecuteRuling();

  // Determine if ruling has been executed (status === 3)
  const isFinished = dispute?.status === 3;

  // Check if dispute is ready for execution (status === 2, in REVEAL phase)
  const isReadyForExecution = dispute?.status === 2;

  // Fetch Real Financials - Enable when ready for execution OR already finished
  const {
    principal,
    reward,
    total,
    currency,
    isWinner,
    isLoading: isFinanceLoading,
  } = useDisputeFinancials(disputeId, isReadyForExecution || isFinished);

  const hasWinnerResult = isWinner !== null;
  const didWin = isWinner === true;
  const didLose = isWinner === false;

  const [showSuccess, setShowSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const bindSwipe = usePageSwipe({
    onSwipeRight: () => router.back(),
  });

  // Configure header
  useHeader({
    title: "Ruling Phase",
  });

  const handleExecute = async () => {
    if (!dispute) return;
    if (dispute.status !== 2) {
      toast.error("Dispute is not ready for execution yet.");
      return;
    }

    // 1. Execute transaction
    const success = await executeRuling(disputeId);

    if (success) {
      // 2. CRITICAL FIX: Add a delay to allow RPC indexing
      // 2 seconds is usually enough for standard RPCs to catch up
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 3. Now refetch. The RPC should have the new state (Status 3) by now.
      await refetch();

      // 4. Update UI
      setShowSuccess(true);

      // 5. Refresh server components
      router.refresh();
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccess(false);
    toast.info(
      "Ruling executed. You can review any balance updates in your Profile.",
    );
    router.push("/profile");
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col flex-1 relative overflow-hidden font-manrope"
      {...bindSwipe()}
    >
      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="min-h-full flex flex-col justify-center">
          {/* 2. Hero Section: The "Bag" */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6">
              <div
                className={`w-24 h-24 rounded-[32px] flex items-center justify-center rotate-3 ${
                  isFinanceLoading
                    ? "bg-gray-100"
                    : isReadyForExecution
                      ? !hasWinnerResult
                        ? "bg-gray-100"
                        : didWin
                        ? "bg-[#8c8fff]/10"
                        : "bg-orange-50"
                      : isFinished
                        ? !hasWinnerResult
                          ? "bg-gray-100"
                          : didWin
                          ? "bg-[#8c8fff]/10"
                          : "bg-red-50"
                        : "bg-gray-100"
                }`}
              >
                {isFinanceLoading ? (
                  <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                ) : isReadyForExecution || isFinished ? (
                  !hasWinnerResult ? (
                    <Gavel className="w-10 h-10 text-gray-400" />
                  ) : didWin ? (
                    <Wallet className="w-10 h-10 text-[#8c8fff]" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-orange-400" />
                  )
                ) : (
                  <Gavel className="w-10 h-10 text-gray-400" />
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
              {isFinanceLoading
                ? "Calculating results..."
                : isFinished
                  ? !hasWinnerResult
                    ? "Finalizing your result..."
                    : didWin
                    ? "You voted with the majority. Your rewards have been added to your profile."
                    : "The majority voted differently. You will not receive a reward for this dispute."
                  : isReadyForExecution
                    ? !hasWinnerResult
                      ? "Finalizing your result..."
                      : didWin
                      ? "You voted with the majority! Execute to claim your rewards."
                      : "You voted with the minority. Execute to finalize the dispute."
                    : "Execute the ruling to finalize the dispute and see your results."}
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
            {isFinanceLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-gray-300" />
              </div>
            ) : isReadyForExecution || isFinished ? (
              <div className="flex flex-col gap-3">
                <RewardRow
                  label="Staked Principal"
                  value={`${principal} ${currency}`}
                  icon={
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${didWin ? "bg-gray-300" : didLose ? "bg-red-300" : "bg-gray-200"}`}
                    />
                  }
                  strikethrough={didLose}
                />

                <RewardRow
                  label="Arbitration Reward"
                  value={`${didWin ? "+" : ""}${reward} ${currency}`}
                  isHighlight={didWin}
                  icon={
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${didWin ? "bg-[#8c8fff]" : "bg-gray-200"}`}
                    />
                  }
                />
              </div>
            ) : (
              <div className="flex justify-center py-4 text-sm text-gray-400">
                Waiting for voting to complete
              </div>
            )}

            {/* Total Section */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  {isFinished ? "Total Payout" : "Estimated Payout"}
                </span>
                <span className="text-[10px] font-medium text-[#8c8fff]">
                  Principal + Rewards
                </span>
              </div>
              <span
                className={`text-xl font-extrabold ${isFinanceLoading ? "text-gray-300" : isReadyForExecution || isFinished ? (didWin ? "text-[#1b1c23]" : "text-gray-300") : "text-gray-300"}`}
              >
                {isFinanceLoading
                  ? "..."
                  : isReadyForExecution || isFinished
                    ? `${total} ${currency}`
                    : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Floating Action Bar */}
      <div className="shrink-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="max-w-sm mx-auto">
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
