import { useRouter } from "next/navigation";
import { DISPUTE_STATUS } from "@/config/app";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Tag,
  Users,
  Coins,
  Clock,
  Monitor,
  Briefcase,
  ShoppingBag,
  Scale,
  Gavel,
  Lock,
  Archive,
} from "lucide-react";
import type { Dispute } from "@/hooks/disputes/useDisputeList";
import { cn } from "@/lib/utils";

// Helper to get Lucide icon component based on category string
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

  // Default / General
  return <Scale className={className} />;
};

type DisputeUI = Dispute & {
  votesCount?: number;
  totalVotes?: number;
  prize?: string;
  icon?: string;
  voters?: Array<{ isMe: boolean; vote: number }>;
};

const VOTE_APPROVE = 1;

export const DisputeCard = ({ dispute }: { dispute: DisputeUI }) => {
  const router = useRouter();

  const handleReadDispute = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/disputes/${dispute.id}/file`);
  };

  const handleWithdraw = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/disputes/${dispute.id}/execute`);
  };

  // Status mapping
  // Status mapping
  const isReveal = dispute.status === DISPUTE_STATUS.REVEAL;
  const isFinished = dispute.status === DISPUTE_STATUS.RESOLVED;
  const isReadyForWithdrawal =
    dispute.status === DISPUTE_STATUS.REVEAL && dispute.phase === "WITHDRAW";

  const myVote = dispute.voters?.find((v) => v.isMe)?.vote;

  return (
    <div
      onClick={handleReadDispute}
      className="group relative bg-white rounded-3xl p-5 border border-gray-200 shadow-md transition-all duration-300 hover:shadow-xl hover:border-[#8c8fff]/40 cursor-pointer overflow-hidden active:scale-[0.99]"
    >
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-[#8c8fff]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* --- Top Row: Category & Stake --- */}
        <div className="flex justify-between items-start">
          {/* Category Badge */}
          <div className="flex items-center gap-1.5 bg-[#F8F9FC] border border-gray-200 rounded-full px-2.5 py-1.5 group-hover:bg-white group-hover:shadow-sm transition-all">
            <CategoryIcon
              category={dispute.category}
              className="w-3.5 h-3.5 text-[#8c8fff]"
            />
            <span className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wide">
              {dispute.category}
            </span>
          </div>

          {/* Stake Display */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              Prize Pool
            </span>
            <div className="flex items-center gap-1.5 text-[#1b1c23]">
              <Coins className="w-3.5 h-3.5 text-[#8c8fff]" />
              <span className="font-manrope font-black text-base">
                {dispute.stake}{" "}
                <span className="text-xs font-bold text-gray-400">USDC</span>
              </span>
            </div>
          </div>
        </div>

        {/* --- Middle: Title & Votes --- */}
        <div>
          <h3 className="font-manrope font-extrabold text-base text-[#1b1c23] leading-snug mb-2.5 group-hover:text-[#8c8fff] transition-colors line-clamp-2">
            {dispute.title}
          </h3>

          {!isFinished && (
            <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>
                  {dispute.votesCount || 0}/{dispute.jurorsRequired} Jurors
                </span>
              </div>
              {dispute.deadlineLabel && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className={dispute.isUrgent ? "text-rose-500" : ""}>
                    {dispute.deadlineLabel}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- Separator --- */}
        <div className="h-px w-full bg-gray-100 group-hover:bg-[#8c8fff]/10 transition-colors" />

        {/* --- Footer: Status & Action --- */}
        <div className="flex items-center justify-between">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {myVote !== undefined ? (
              // User has voted
              <div className="flex items-center gap-1.5">
                {myVote === VOTE_APPROVE ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className="text-[11px] font-bold text-gray-500">
                  You voted {myVote === VOTE_APPROVE ? "Claimant" : "Defendant"}
                </span>
              </div>
            ) : (
              // User hasn't voted / Status View
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isFinished
                      ? "bg-green-500"
                      : isReveal
                        ? "bg-orange-400"
                        : "bg-[#8c8fff]",
                  )}
                />
                <span className="text-[11px] font-bold text-gray-500">
                  {isFinished
                    ? "Resolved"
                    : isReveal
                      ? "Reveal Phase"
                      : "Voting Open"}
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          {isReadyForWithdrawal ? (
            <button
              onClick={handleWithdraw}
              className="flex items-center gap-1.5 bg-[#1b1c23] text-white px-3 py-1.5 rounded-lg font-manrope font-bold text-[10px] shadow-md shadow-gray-300 hover:bg-[#2c2d33] transition-all active:scale-95 uppercase tracking-wide"
            >
              <Wallet className="w-3 h-3" />
              <span>Withdraw</span>
            </button>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#F5F6F9] text-[#1b1c23] flex items-center justify-center group-hover:bg-[#1b1c23] group-hover:text-white transition-all duration-300 border border-gray-100">
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
