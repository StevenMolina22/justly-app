"use client";

import { useRouter } from "next/navigation";
import { DISPUTE_STATUS } from "@/config/app";
import {
  Wallet,
  Users,
  Coins,
  Clock,
  Monitor,
  Briefcase,
  ShoppingBag,
  Scale,
  Flame,
} from "lucide-react";
import type { Dispute } from "@/hooks/disputes/useDisputeList";
import { cn } from "@/lib/utils";

// Helper: Pass through formatted time label from adapter
const formatTimeLeft = (label: string | undefined) => {
  // The adapter now handles hours->days conversion, just pass through
  return label || "";
};

// Helper: Icon mapping
const CategoryIcon = ({
  category,
  className,
}: {
  category: string;
  className?: string;
}) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("tech") || cat.includes("software"))
    return <Monitor className={className} />;
  if (cat.includes("freelance") || cat.includes("service"))
    return <Briefcase className={className} />;
  if (cat.includes("commerce") || cat.includes("shop"))
    return <ShoppingBag className={className} />;
  return <Scale className={className} />;
};

type DisputeUI = Dispute & {
  votesCount?: number;
  totalVotes?: number;
  prize?: string;
  icon?: string;
  voters?: Array<{ isMe: boolean; vote: number }>;
};

export const DisputeCard = ({ dispute }: { dispute: DisputeUI }) => {
  const router = useRouter();

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Logic: If active -> Vote/Review. If finished -> Results.
    if (dispute.status === DISPUTE_STATUS.RESOLVED) {
      router.push(`/disputes/${dispute.id}/execute`);
    } else {
      router.push(`/disputes/${dispute.id}`);
    }
  };

  const handleWithdraw = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/disputes/${dispute.id}/execute`);
  };

  // --- Derived State ---
  const isReveal = dispute.status === DISPUTE_STATUS.REVEAL;
  const isFinished = dispute.status === DISPUTE_STATUS.RESOLVED;
  const isReadyForWithdrawal = isReveal && dispute.phase === "WITHDRAW";

  // Calculate "Earn per Juror" (Estimated)
  // Prefer myStake if available (user's specific stake), otherwise use stake (generic requirement)
  const stakeAmount = dispute.myStake || dispute.stake || "0";
  const totalStake = parseFloat(stakeAmount);
  const estEarn =
    dispute.jurorsRequired > 0
      ? ((totalStake / dispute.jurorsRequired) * 0.5).toFixed(2)
      : "0";

  const timeLeft = formatTimeLeft(dispute.deadlineLabel);

  // Trending Logic: If > 50% filled
  const isTrending = (dispute.votesCount || 0) > dispute.jurorsRequired / 2;

  return (
    <div
      onClick={handleOpen}
      className="group relative bg-white rounded-3xl p-6 border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 cursor-pointer active:scale-[0.99]"
    >
      {/* 1. Header: Category & Urgency */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-100 rounded-full px-2.5 py-1 text-xs font-bold text-gray-600 uppercase tracking-wide group-hover:bg-[#8c8fff]/5 group-hover:text-[#8c8fff] group-hover:border-[#8c8fff]/20 transition-colors">
            <CategoryIcon
              category={dispute.category}
              className="w-3 h-3 text-[#8c8fff]"
            />
            {dispute.category}
          </div>

          {isTrending && !isFinished && (
            <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              <Flame className="w-3 h-3 fill-orange-500" /> Hot
            </div>
          )}
        </div>

        {!isFinished && timeLeft && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
            <Clock
              className={cn(
                "w-3.5 h-3.5",
                dispute.isUrgent ? "text-rose-500" : "",
              )}
            />
            <span className={cn(dispute.isUrgent ? "text-rose-500" : "")}>
              {timeLeft}
            </span>
          </div>
        )}
      </div>

      {/* 2. Main Content: Title & Story Hook */}
      <div className="mb-5">
        <h3 className="font-manrope font-extrabold text-xl text-[#1b1c23] leading-tight mb-2 group-hover:text-[#8c8fff] transition-colors">
          {dispute.title}
        </h3>
        <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">
          {/* Fallback description if none provided */}
          {dispute.description !== "No description provided."
            ? dispute.description
            : "Review evidence and cast your vote on this case."}
        </p>
      </div>

      {/* 3. The "Hook": Reward & Social Proof */}
      <div className="bg-[#F6F7FA] rounded-2xl p-4 flex items-center justify-between border border-gray-50 group-hover:border-[#8c8fff]/10 group-hover:bg-[#8c8fff]/5 transition-colors">
        {/* Reward Side */}
        <div className="flex flex-col justify-center">
          <span className="text-[12px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">
            Est. Earnings
          </span>

          <div className="flex items-center justify-center gap-1.5">
            <Coins className="w-4 h-4 text-[#8c8fff] fill-[#8c8fff]/20" />

            <span className="text-xl font-bold text-[#1b1c23]  leading-none">
              {estEarn}
            </span>

            <span className="text-xs  font-bold text-gray-500 leading-none">
              USDC
            </span>
          </div>
        </div>

        {/* Social Divider */}
        <div className="w-px h-12 bg-gray-300 mx-2" />

        {/* Social Side */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">
            Activity
          </span>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-bold text-gray-700">
              {dispute.votesCount || 0}{" "}
              <span className="text-gray-500 font-medium">Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Action Button (Only for Withdrawals) */}
      {isReadyForWithdrawal && (
        <div className="mt-4 w-full">
          <button
            onClick={handleWithdraw}
            className="w-full py-3 bg-[#1b1c23] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Wallet className="w-3.5 h-3.5" /> Claim Reward
          </button>
        </div>
      )}
    </div>
  );
};
