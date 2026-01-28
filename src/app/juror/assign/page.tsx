"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssignDispute } from "@/hooks/actions/useAssignDispute";
import { Shuffle, Loader2, AlertCircle } from "lucide-react";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";

export default function JurorAssignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "50";

  const { drawDispute, isLoading, isReady } = useAssignDispute();
  const [hasDrafted, setHasDrafted] = useState(false);
  const [draftFailed, setDraftFailed] = useState(false);
  const initialized = useRef(false);

  // Auto-trigger the draft process when page loads and wallet is ready
  useEffect(() => {
    if (!isReady || initialized.current || hasDrafted) return;

    const runDraft = async () => {
      initialized.current = true; // Prevent double-fire
      setDraftFailed(false);

      try {
        const disputeId = await drawDispute(amount);

        if (disputeId) {
          setHasDrafted(true);
          // Redirect to the success/details page for that specific dispute
          router.replace(`/juror/assigned/${disputeId}`);
        } else {
          // Handle failure (stay on page to allow retry)
          setDraftFailed(true);
          initialized.current = false; // Unlock to allow retry if state changes
        }
      } catch (err) {
        // Handle unexpected errors
        console.error("[JurorAssign] Draft error:", err);
        setDraftFailed(true);
        initialized.current = false; // Unlock on crash
      }
    };

    runDraft();
  }, [isReady, drawDispute, amount, router, hasDrafted]);

  const handleRetry = () => {
    setDraftFailed(false);
    initialized.current = false;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4">
      <DisputeOverviewHeader onBack={() => router.back()} />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        {draftFailed ? (
          /* STATE: DRAFT FAILED */
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-[#1b1c23]">
              Draft Unsuccessful
            </h2>
            <p className="text-gray-500 max-w-[260px]">
              We couldn&apos;t assign you to a dispute. There may be no open
              cases, or the transaction was rejected.
            </p>
            <button
              onClick={handleRetry}
              className="px-8 py-3 bg-[#1b1c23] text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        ) : isLoading || !hasDrafted ? (
          /* STATE: DRAFTING ANIMATION */
          <>
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4 mx-auto relative overflow-hidden">
              {/* Cool shuffling animation */}
              <div className="absolute inset-0 bg-indigo-500/10 animate-[spin_3s_linear_infinite]" />
              <Shuffle className="w-10 h-10 text-indigo-600 animate-pulse relative z-10" />
            </div>
            <h2 className="text-xl font-bold text-[#1b1c23]">
              {isReady
                ? "Entering the Jury Pool..."
                : "Connecting to Network..."}
            </h2>
            <p className="text-gray-500 px-8 max-w-[300px]">
              {isReady ? (
                <>
                  We are randomly selecting a case for you based on your stake
                  of <b>{amount} USDC</b>.
                </>
              ) : (
                "Establishing secure connection to the protocol..."
              )}
            </p>
          </>
        ) : (
          /* STATE: SUCCESS (Ideally we redirect fast enough to not see this much) */
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        )}
      </div>
    </div>
  );
}
