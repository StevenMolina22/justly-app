"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wallet, CheckCircle2 } from "lucide-react";
import { useSliceConnect } from "@/hooks/core/useSliceConnect";
import { useAccount } from "wagmi";
import { useMyDisputes } from "@/hooks/disputes/useMyDisputes";
import {
  JurorTaskCard,
  type TaskState,
} from "@/components/disputes/JurorTaskCard";
import type { DisputeUI } from "@/util/disputeAdapter";
import { useHeader } from "@/lib/hooks/useHeader";

export default function JurorTasksPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { connect } = useSliceConnect();

  const { disputes, isLoading } = useMyDisputes();

  // Filter to active tasks only:
  // - VOTE phase: always show (user needs to commit)
  // - REVEAL phase: show if user hasn't revealed yet, OR if all jurors revealed (ready to execute)
  // - Exclude CLOSED/FINISHED disputes
  const tasks = disputes.filter((d) => {
    // VOTE phase - always a pending task
    if (d.phase === "VOTE") return true;

    // REVEAL phase - check sub-states
    if (d.phase === "REVEAL" || d.phase === "WITHDRAW") {
      // Case 4: User hasn't revealed yet - show as task
      if (!d.userHasRevealed) return true;

      // Case 1 & 2: User revealed - check if others have too
      const allRevealed =
        d.revealsCount >= d.commitsCount && d.commitsCount > 0;

      // Case 2: All revealed, ready to execute - show as task
      if (allRevealed) return true;

      // Case 1: Waiting for others - show as waiting state
      return true;
    }

    return false;
  });

  const handleAction = (task: DisputeUI, state: TaskState) => {
    if (state === "VOTE_PENDING") router.push(`/disputes/${task.id}/vote`);
    else if (state === "REVEAL_PENDING")
      router.push(`/disputes/${task.id}/reveal`);
    else if (state === "READY_TO_EXECUTE")
      router.push(`/disputes/${task.id}/execute`);
    // WAITING_FOR_OTHERS has no action
  };

  // Configure header with dynamic badge
  useHeader({
    title: "Your Missions",
    showBack: true,
    rightElement: tasks.length > 0 ? (
      <div className="bg-[#8c8fff] text-white text-xs font-extrabold px-4 py-2 rounded-full shadow-lg shadow-[#8c8fff]/30">
        {tasks.length} <span className="ml-1">Pending</span>
      </div>
    ) : undefined,
  });

  return (
    <div className="flex flex-col flex-1 font-manrope relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#8c8fff]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex-1 px-5 w-full flex flex-col gap-6 relative z-10">
        {!address ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <Wallet className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-[#1b1c23]">
              Sync Your Profile
            </h3>
            <button
              onClick={() => connect()}
              className="mt-6 px-8 py-3.5 bg-[#1b1c23] text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200"
            >
              Connect Wallet
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#8c8fff]" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
              Fetching Disputes...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-28 h-28 bg-linear-to-tr from-white to-[#F0F2F5] rounded-full flex items-center justify-center mb-6 border-[6px] border-[#F8F9FC] shadow-xl">
              <CheckCircle2 className="w-12 h-12 text-[#8c8fff]" />
            </div>
            <h3 className="text-2xl font-black text-[#1b1c23] tracking-tight">
              All Clear!
            </h3>
            <p className="text-base text-gray-500 mt-2 max-w-60 mx-auto font-medium">
              Great job. You have no pending actions at the moment.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-8 px-6 py-3.5 bg-white border border-gray-100 text-[#1b1c23] rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
            >
              Browse Active Cases
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 pb-10">
            {tasks.map((task, index) => (
              <JurorTaskCard
                key={task.id}
                task={task}
                index={index}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
