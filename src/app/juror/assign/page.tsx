"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssignDispute } from "@/hooks/actions/useAssignDispute";
import { Shuffle, Loader2, AlertCircle, Scale } from "lucide-react";
import { useHeader } from "@/lib/hooks/useHeader";

import { usePublicClient, useChainId } from "wagmi";
import { SLICE_ABI, getContractsForChain } from "@/config/contracts";

export default function JurorAssignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "50";

  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { sliceContract } = getContractsForChain(chainId);

  const { drawDispute, isLoading: isTxLoading, isReady } = useAssignDispute();

  // Configure header (minimal)
  useHeader({
    title: undefined,
  });

  // State
  const [hasDrafted, setHasDrafted] = useState(false);
  const [draftFailed, setDraftFailed] = useState(false);
  const [noDisputesAvailable, setNoDisputesAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const initialized = useRef(false);

  // Auto-trigger: Check Queue -> Then Draft
  useEffect(() => {
    if (
      !isReady ||
      !publicClient ||
      !sliceContract ||
      initialized.current ||
      hasDrafted
    )
      return;

    const executeDraftFlow = async () => {
      initialized.current = true;
      setDraftFailed(false);
      setNoDisputesAvailable(false);
      setIsChecking(true);

      try {
        // 1. PRE-CHECK: Are there any disputes in the queue?
        // We try to read the first item in the queue. If it reverts, the queue is empty.
        try {
          await publicClient.readContract({
            address: sliceContract,
            abi: SLICE_ABI,
            functionName: "openDisputeIds",
            args: [0n], // Try to read index 0
          });
        } catch (_e) {
          // If reading index 0 fails, the array is empty
          console.warn("Queue appears empty, aborting draft.");
          setNoDisputesAvailable(true);
          setIsChecking(false);
          return;
        }

        // 2. EXECUTE DRAFT: If we passed the check, try to join
        const disputeId = await drawDispute(amount);

        if (disputeId) {
          setHasDrafted(true);
          router.replace(`/juror/assigned/${disputeId}`);
        } else {
          // If drawDispute returns null, it failed (user rejection or race condition)
          setDraftFailed(true);
          initialized.current = false; // Allow retry
        }
      } catch (err) {
        console.error("[JurorAssign] Unexpected error:", err);
        setDraftFailed(true);
        initialized.current = false;
      } finally {
        setIsChecking(false);
      }
    };

    executeDraftFlow();
  }, [
    isReady,
    drawDispute,
    amount,
    router,
    hasDrafted,
    publicClient,
    sliceContract,
  ]);

  const handleRetry = () => {
    setDraftFailed(false);
    setNoDisputesAvailable(false);
    initialized.current = false;
  };

  // Combined loading state
  const isBusy = isChecking || isTxLoading;

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center p-4">
        {/* SCENARIO 1: NO DISPUTES AVAILABLE */}
        {noDisputesAvailable ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-2">
              <Scale className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-[#1b1c23]">
              No Cases Available
            </h2>
            <p className="text-gray-500 max-w-70">
              The dispute queue is currently empty. There are no active cases
              waiting for jurors right now.
            </p>
            <button
              onClick={() => router.push("/")} // Go back to dashboard
              className="px-8 py-3 bg-[#1b1c23] text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              Return to Dashboard
            </button>
            <button
              onClick={handleRetry}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Check Again
            </button>
          </div>
        ) : /* SCENARIO 2: GENERIC TRANSACTION FAILURE */
        draftFailed ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-[#1b1c23]">
              Draft Unsuccessful
            </h2>
            <p className="text-gray-500 max-w-65">
              We couldn&apos;t assign you to a dispute. The transaction may have
              been rejected or failed.
            </p>
            <button
              onClick={handleRetry}
              className="px-8 py-3 bg-[#1b1c23] text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        ) : /* SCENARIO 3: LOADING / DRAFTING */
        isBusy || !hasDrafted ? (
          <>
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4 mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/10 animate-[spin_3s_linear_infinite]" />
              <Shuffle className="w-10 h-10 text-indigo-600 animate-pulse relative z-10" />
            </div>
            <h2 className="text-xl font-bold text-[#1b1c23]">
              {isReady
                ? "Entering the Jury Pool..."
                : "Connecting to Network..."}
            </h2>
            <p className="text-gray-500 px-8 max-w-75">
              {isReady ? (
                <>
                  We are looking for open cases matching your stake of{" "}
                  <b>{amount} USDC</b>.
                </>
              ) : (
                "Establishing secure connection to the protocol..."
              )}
            </p>
          </>
        ) : (
          /* SCENARIO 4: SUCCESS REDIRECT STUB */
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        )}
      </div>
    </div>
  );
}
