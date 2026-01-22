"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { RefreshCw, Scale, Home, Eye, ArrowRight, Lock } from "lucide-react";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { PaginationDots } from "@/components/dispute-overview/PaginationDots";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import { DisputeCandidateCard } from "@/components/disputes/DisputeCandidateCard";
import { VsBadge } from "@/components/disputes/VsBadge";
import { useVote } from "@/hooks/voting/useVote";
import { usePageSwipe } from "@/hooks/ui/usePageSwipe";
import { useDisputeParties } from "@/hooks/disputes/useDisputeParties";

export default function VotePage() {
  const router = useRouter();
  const { id: disputeId } = useParams() as { id: string };
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    dispute,
    selectedVote,
    hasCommittedLocally,
    isRefreshing,
    isProcessing,
    isCommitDisabled,
    isRevealDisabled,
    handleVoteSelect,
    handleCommit,
    handleRefresh,
  } = useVote(disputeId || "1");

  const parties = useDisputeParties(dispute);

  const bindSwipe = usePageSwipe({
    onSwipeRight: () =>
      router.push(`/disputes/${disputeId}/evidence/defendant`),
  });

  const onCommitClick = async () => {
    const success = await handleCommit();
    if (success) {
      /* Success is typically handled by toast or UI update */
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccess(false);
    router.push("/disputes");
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FC]" {...bindSwipe()}>
      {/* 1. Header */}
      <div className="flex-none z-10 bg-[#F8F9FC]/80 backdrop-blur-md">
        <DisputeOverviewHeader onBack={() => router.back()} />
      </div>

      {/* 2. Content */}
      <div className="flex-1 flex flex-col px-6 overflow-y-auto scrollbar-hide relative z-0">
        {/* - Removed min-h-[500px] to prevent top-alignment on small screens
          - Added py-10 to ensure breathing room on short screens
        */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto pb-24 pt-4">
          {/* Title Section - Centered & Cohesive */}
          <div className="relative mb-8 text-center">
            <h2 className="text-3xl font-black text-[#1b1c23] leading-tight tracking-tight">
              Make your <br />
              <span className="text-[#8c8fff]">judgement</span>
            </h2>
            <p className="text-sm font-semibold text-gray-500 mt-2">
              Review evidence and select a winner.
            </p>

            {/* Refresh Button - Absolute positioned to not break center alignment */}
            <button
              onClick={() => void handleRefresh()}
              disabled={isRefreshing || isProcessing}
              className="absolute top-1 right-0 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm text-[#8c8fff] active:scale-90 transition-all hover:bg-gray-50"
              title="Refresh Status"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Cards Section */}
          <div className="flex flex-col gap-6 relative">
            <div className="relative z-10">
              <div className="transform transition-transform active:scale-[0.98]">
                <DisputeCandidateCard
                  type="vote"
                  partyInfo={parties.claimer}
                  isSelected={selectedVote === 1}
                  isDisabled={hasCommittedLocally}
                  onClick={() => handleVoteSelect(1)}
                  className="w-full h-32" // Ensuring larger size
                />
              </div>
              <VsBadge />
            </div>

            <div className="transform transition-transform active:scale-[0.98]">
              <DisputeCandidateCard
                type="vote"
                partyInfo={parties.defender}
                isSelected={selectedVote === 0}
                isDisabled={hasCommittedLocally}
                onClick={() => handleVoteSelect(0)}
                className="w-full h-32" // Ensuring larger size
              />
            </div>
          </div>

          {/* Status Notifications */}
          <div className="mt-8 min-h-[24px]">
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#8c8fff] animate-pulse bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mx-auto w-fit shadow-sm">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>SECURING VOTE ON-CHAIN...</span>
              </div>
            )}

            {hasCommittedLocally && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-xl shadow-gray-200/50 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#1b1c23]">
                    Vote Secured
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-tight">
                    Your decision is encrypted. You must reveal it in the next
                    phase.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-20 flex justify-center pb-8">
        <div className="w-full max-w-sm flex flex-col gap-5">
          <div className="mb-1">
            <PaginationDots currentIndex={3} total={4} />
          </div>

          {!hasCommittedLocally ? (
            <button
              onClick={() => void onCommitClick()}
              disabled={isCommitDisabled}
              className={`
                w-full py-4 px-6 rounded-[20px] font-manrope font-semibold text-lg tracking-wide transition-all duration-300 shadow-xl flex items-center justify-center gap-3
                ${
                  isCommitDisabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-[#1b1c23] text-white hover:scale-[1.02] active:scale-[0.98] shadow-gray-200"
                }
              `}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>COMMITTING...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" /> <span>CAST VOTE</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() =>
                isRevealDisabled
                  ? router.push("/disputes")
                  : router.push(`/disputes/${disputeId}/reveal`)
              }
              className={`
                w-full py-5 px-6 rounded-[20px] font-manrope font-bold text-lg tracking-wide transition-all duration-300 flex items-center justify-center gap-3
                ${
                  isRevealDisabled
                    ? "bg-white text-[#1b1c23] border border-gray-200 shadow-lg hover:bg-gray-50"
                    : "bg-[#1b1c23] text-white shadow-xl shadow-gray-200 hover:scale-[1.02]"
                }
              `}
            >
              {isRevealDisabled ? (
                <>
                  <Home className="w-5 h-5" /> <span>RETURN HOME</span>
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" /> <span>GO TO REVEAL</span>
                  <ArrowRight className="w-5 h-5" />
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
