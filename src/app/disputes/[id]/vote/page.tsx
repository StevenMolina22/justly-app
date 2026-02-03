"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { RefreshCw, Home, Eye, ArrowRight, Lock } from "lucide-react";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import { DisputeCandidateCard } from "@/components/disputes/DisputeCandidateCard";
import { VsBadge } from "@/components/disputes/VsBadge";
import { useVote } from "@/hooks/voting/useVote";
import { usePageSwipe } from "@/hooks/ui/usePageSwipe";
import { useDisputeParties } from "@/hooks/disputes/useDisputeParties";
import { useHeader } from "@/lib/hooks/useHeader";
import { SwipeButton } from "@/components/SwipeButton";

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

  // Configure header
  useHeader({
    title: "Cast Vote",
  });

  const onCommitClick = async () => {
    const success = await handleCommit();
    if (success) {
      // Refresh the page data to reflect the new on-chain state
      router.refresh();
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccess(false);
    router.push("/disputes");
  };

  return (
    <div className="flex flex-col flex-1 relative" {...bindSwipe()}>
      {/* 2. Content */}
      <div className="flex-1 flex flex-col px-6 scrollbar-hide relative z-0">
        <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto pb-6 pt-4">
          {/* Title Section - Centered & Cohesive */}
          <div className="relative mb-8 text-center">
            <h2 className="text-3xl font-black text-[#1b1c23] leading-tight tracking-tight">
              Make your <br />
              <span className="text-[#8c8fff]">judgement</span>
            </h2>
            <p className="text-sm font-semibold text-gray-500 mt-2">
              Review evidence and select a winner.
            </p>

            {/* Refresh Button */}
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
                  className="w-full h-32"
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
                className="w-full h-32"
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
      <div className="shrink-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-20 flex justify-center pb-8">
        <div className="w-full max-w-sm">
          {!hasCommittedLocally ? (
            <SwipeButton
              onSwipeComplete={() => void onCommitClick()}
              isLoading={isProcessing}
              disabled={isCommitDisabled}
            >
              SWIPE TO VOTE
            </SwipeButton>
          ) : (
            <button
              onClick={() =>
                isRevealDisabled
                  ? router.push("/")
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
