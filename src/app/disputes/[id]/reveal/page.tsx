"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RefreshCw,
  Clock,
  Lock,
  Gavel,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { PaginationDots } from "@/components/dispute-overview/PaginationDots";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import { DisputeCandidateCard } from "@/components/disputes/DisputeCandidateCard";
import { useReveal } from "@/hooks/voting/useReveal";
import { usePageSwipe } from "@/hooks/ui/usePageSwipe";
import { useDisputeParties } from "@/hooks/disputes/useDisputeParties";

export default function RevealPage() {
  const router = useRouter();
  const { id: disputeId } = useParams() as { id: string };
  const [showSuccess, setShowSuccess] = useState(false);

  // Hook handles logic & state
  const { dispute, localVote, status, revealVote, isProcessing, logs } =
    useReveal(disputeId || "1");

  const parties = useDisputeParties(dispute);

  const bindSwipe = usePageSwipe({
    onSwipeRight: () => router.push(`/disputes/${disputeId}/vote`),
  });

  const handleRevealClick = async () => {
    if (await revealVote()) setShowSuccess(true);
  };

  const handleAnimationComplete = () => {
    setShowSuccess(false);
    router.push("/");
  };

  // Helper to get the party we voted for
  const votedParty = localVote === 1 ? parties.claimer : parties.defender;
  const hasVoteToReveal = localVote !== null;

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FC]" {...bindSwipe()}>
      {/* 1. Header */}
      <div className="flex-none z-10 bg-[#F8F9FC]/80 backdrop-blur-md">
        <DisputeOverviewHeader onBack={() => router.back()} />
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 flex flex-col px-6 overflow-y-auto scrollbar-hide relative z-0">
        <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto pb-24 pt-4">
          {/* STATE 1: TOO EARLY (Locked) */}
          {status.isTooEarly && (
            <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center relative border border-gray-200 shadow-inner">
                <Clock className="w-10 h-10 text-gray-400" />
                <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-[#1b1c23] rounded-full flex items-center justify-center border-[4px] border-[#F8F9FC] shadow-lg">
                  <Lock className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-[#1b1c23] tracking-tight">
                  Reveal Locked
                </h3>
                <p className="text-sm font-medium text-gray-500 max-w-[260px] mx-auto leading-relaxed">
                  The court is still voting. You can confirm your decision once
                  the commit phase ends.
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: REVEAL OPEN (Actionable) */}
          {status.isRevealOpen && (
            <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4">
              {/* Title Section */}
              <div className="text-center">
                <h2 className="text-3xl font-black text-[#1b1c23] leading-tight tracking-tight">
                  Confirm Vote
                </h2>
                <p className="text-sm font-semibold text-gray-500 mt-2">
                  Reveal your secret vote to the chain.
                </p>
              </div>

              {/* The "Chosen One" Card */}
              <div className="relative pt-3">
                {hasVoteToReveal ? (
                  <div className="transform transition-all duration-500 hover:scale-[1.02]">
                    <DisputeCandidateCard
                      type="reveal"
                      partyInfo={votedParty}
                      isSelected={true}
                      className="w-full h-32 border-[#1b1c23] ring-1 ring-[#1b1c23]/10 shadow-xl"
                    />

                    {/* FIX: Added z-20 to ensure it sits ON TOP of the card (which is z-10) */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1b1c23] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 z-20 border-2 border-white">
                      <CheckCircle2 className="w-3 h-3 text-[#8c8fff]" />
                      Your Choice
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-50 border border-dashed border-gray-300 rounded-[24px] flex flex-col items-center justify-center text-center p-4 gap-2">
                    <HelpCircle className="w-6 h-6 text-gray-400" />
                    <p className="text-xs font-bold text-gray-400">
                      Vote data syncing...
                    </p>
                  </div>
                )}
              </div>

              {/* Processing Status */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#8c8fff] animate-pulse bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mx-auto w-fit shadow-sm border border-[#8c8fff]/20">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{logs || "SECURING ON-CHAIN..."}</span>
                </div>
              )}
            </div>
          )}

          {/* STATE 3: FINISHED (Post-Reveal) */}
          {status.isFinished && (
            <div className="flex flex-col items-center justify-center gap-6 text-center animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-2 border border-gray-200">
                <Gavel className="w-10 h-10 text-gray-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#1b1c23] tracking-tight">
                  Dispute Closed
                </h3>
                <p className="text-sm font-medium text-gray-500 max-w-[280px] mx-auto">
                  The ruling has been executed. Check your portfolio for
                  results.
                </p>
              </div>
              <button
                onClick={() => router.push(`/disputes/${disputeId}`)}
                className="mt-4 px-8 py-3.5 bg-white border border-gray-200 text-[#1b1c23] rounded-2xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all active:scale-95"
              >
                Return to Overview
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Footer Action */}
      {status.isRevealOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-20 flex justify-center pb-8">
          <div className="w-full max-w-sm flex flex-col gap-5">
            <div className="mb-1">
              <PaginationDots currentIndex={3} total={4} />
            </div>

            <button
              onClick={() => void handleRevealClick()}
              disabled={isProcessing || !hasVoteToReveal}
              className={`
                w-full py-4 px-6 rounded-[20px] font-manrope font-semibold text-lg tracking-wide transition-all duration-300 shadow-xl flex items-center justify-center gap-3
                ${
                  isProcessing || !hasVoteToReveal
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200"
                    : "bg-[#1b1c23] text-white hover:scale-[1.02] active:scale-[0.98] shadow-gray-200"
                }
              `}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>CONFIRMING...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> <span>CONFIRM VOTE</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Dots for other states */}
      {!status.isRevealOpen && (
        <div className="fixed bottom-8 left-0 right-0 z-20">
          <PaginationDots currentIndex={3} total={4} />
        </div>
      )}

      {showSuccess && <SuccessAnimation onComplete={handleAnimationComplete} />}
    </div>
  );
}
