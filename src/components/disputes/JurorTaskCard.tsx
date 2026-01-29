"use client";

import {
  Gavel,
  Eye,
  ArrowRight,
  Coins,
  ShieldAlert,
  Zap,
  Clock,
} from "lucide-react";
import type { DisputeUI } from "@/util/disputeAdapter";

// Task state types for juror missions
export type TaskState =
  | "VOTE_PENDING"
  | "REVEAL_PENDING"
  | "WAITING_FOR_OTHERS"
  | "READY_TO_EXECUTE";

/**
 * Determine the precise sub-state for a juror task
 */
export function getTaskState(task: DisputeUI): TaskState {
  // Voting phase
  if (task.phase === "VOTE") return "VOTE_PENDING";

  // Reveal phase logic
  if (task.phase === "REVEAL" || task.phase === "WITHDRAW") {
    // User hasn't revealed yet
    if (!task.userHasRevealed) return "REVEAL_PENDING";

    // User revealed, check if everyone else has
    const allRevealed =
      task.revealsCount >= task.commitsCount && task.commitsCount > 0;

    if (allRevealed) return "READY_TO_EXECUTE";
    return "WAITING_FOR_OTHERS";
  }

  return "VOTE_PENDING"; // fallback
}

interface JurorTaskCardProps {
  task: DisputeUI;
  index: number;
  onAction: (task: DisputeUI, state: TaskState) => void;
}

export function JurorTaskCard({ task, index, onAction }: JurorTaskCardProps) {
  const state = getTaskState(task);
  const isWaiting = state === "WAITING_FOR_OTHERS";

  return (
    <div
      onClick={() => !isWaiting && onAction(task, state)}
      className={`group relative bg-white rounded-[28px] p-1 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in fill-mode-forwards ${
        isWaiting
          ? "opacity-75 cursor-default"
          : "hover:shadow-[0_8px_35px_-5px_rgba(140,143,255,0.15)] cursor-pointer active:scale-[0.98]"
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Status bar color based on state */}
      <div
        className={`absolute left-0 top-8 bottom-8 w-1.5 rounded-r-full ${
          state === "VOTE_PENDING"
            ? "bg-[#8c8fff]"
            : state === "REVEAL_PENDING"
              ? "bg-[#1b1c23]"
              : state === "READY_TO_EXECUTE"
                ? "bg-[#8c8fff]"
                : "bg-gray-300"
        }`}
      />

      <div className="pl-6 pr-5 py-5 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-[#8c8fff] uppercase tracking-widest bg-[#8c8fff]/10 px-2 py-1 rounded-md">
            {task.category}
          </span>
          {task.isUrgent && (
            <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-full animate-pulse">
              <ShieldAlert className="w-3 h-3" /> Urgent
            </span>
          )}
        </div>

        <div className="flex justify-between items-center gap-4">
          <div>
            <h4 className="font-extrabold text-lg text-[#1b1c23] leading-tight line-clamp-2">
              {task.title}
            </h4>
            <div className="mt-1.5 flex items-center gap-2 text-xs font-bold text-gray-400">
              <span className="font-mono text-gray-300">#{task.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-[#8c8fff]" />
                {task.myStake || task.stake} USDC Stake
              </span>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-linear-to-r from-transparent via-[#8c8fff]/20 to-transparent" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl ${
                state === "VOTE_PENDING"
                  ? "bg-[#8c8fff]/10 text-[#8c8fff]"
                  : state === "REVEAL_PENDING"
                    ? "bg-gray-100 text-gray-600"
                    : state === "READY_TO_EXECUTE"
                      ? "bg-[#8c8fff]/10 text-[#8c8fff]"
                      : "bg-gray-50 text-gray-400"
              }`}
            >
              {state === "VOTE_PENDING" ? (
                <Gavel className="w-4 h-4" />
              ) : state === "REVEAL_PENDING" ? (
                <Eye className="w-4 h-4" />
              ) : state === "READY_TO_EXECUTE" ? (
                <Zap className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                {isWaiting ? "Status" : "Deadline"}
              </span>
              <span
                className={`text-xs font-black ${
                  task.isUrgent && !isWaiting
                    ? "text-rose-500"
                    : isWaiting
                      ? "text-gray-500"
                      : "text-[#1b1c23]"
                }`}
              >
                {isWaiting
                  ? `${task.revealsCount}/${task.commitsCount} revealed`
                  : task.deadlineLabel}
              </span>
            </div>
          </div>

          {/* Dynamic action button based on state */}
          {isWaiting ? (
            <div className="pl-5 pr-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 bg-gray-50 flex items-center gap-2 border border-gray-100">
              <Clock className="w-3.5 h-3.5" />
              Waiting for Jurors...
            </div>
          ) : (
            <button
              className={`
                pl-5 pr-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2 transition-all duration-300
                ${state === "VOTE_PENDING" ? "bg-[#1b1c23] hover:bg-[#32363f]" : ""}
                ${state === "REVEAL_PENDING" ? "bg-[#8c8fff] hover:bg-[#7a7de0] shadow-[#8c8fff]/20" : ""}
                ${state === "READY_TO_EXECUTE" ? "bg-[#8c8fff] hover:bg-[#7a7de0] shadow-[#8c8fff]/20" : ""}
              `}
            >
              {state === "VOTE_PENDING" && "Cast Vote"}
              {state === "REVEAL_PENDING" && "Confirm Vote"}
              {state === "READY_TO_EXECUTE" && "Execute Ruling"}
              <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
