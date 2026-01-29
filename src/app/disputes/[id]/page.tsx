"use client";

import { useRouter, useParams } from "next/navigation";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { PaginationDots } from "@/components/dispute-overview/PaginationDots";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { usePageSwipe } from "@/hooks/ui/usePageSwipe";
import { shortenAddress } from "@/util/wallet";
import { DISPUTE_STATUS } from "@/config/app";
import {
  Loader2,
  Clock,
  FileText,
  ArrowRight,
  Scale,
  Gavel,
  Coins,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function DisputeOverviewPage() {
  const [now, setNow] = useState(0);
  const router = useRouter();
  const params = useParams();
  const disputeId = (params?.id as string) || "1";

  const { dispute, loading: isLoading } = useGetDispute(disputeId);

  const handleBack = () => router.back();
  const handleStartReview = () => router.push(`/disputes/${disputeId}/review`);
  const handleOpenCaseFile = () => router.push(`/disputes/${disputeId}/file`);

  const bindSwipe = usePageSwipe({
    onSwipeLeft: handleStartReview,
  });

  // Calculate winner logic
  const isFinished = dispute?.status === DISPUTE_STATUS.RESOLVED;
  const winnerAddress = dispute?.winner?.toLowerCase();

  // Helper to get formatted data
  const statusLabels: Record<number, string> = {
    [DISPUTE_STATUS.CREATED]: "Created",
    [DISPUTE_STATUS.COMMIT]: "Commit",
    [DISPUTE_STATUS.REVEAL]: "Reveal",
    [DISPUTE_STATUS.RESOLVED]: "Executed",
  };

  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000));
  }, []);

  const getDeadlineLabel = () => {
    if (!dispute) return "Loading...";
    if (dispute.status === DISPUTE_STATUS.RESOLVED) return "Resolved";

    // 3. Handle the initial render (before useEffect runs)
    if (now === 0) return "Loading...";

    let targetDeadline = 0;
    if (dispute.status === DISPUTE_STATUS.COMMIT) {
      targetDeadline = dispute.commitDeadline || 0;
    } else if (dispute.status === DISPUTE_STATUS.REVEAL) {
      targetDeadline = dispute.revealDeadline || 0;
    } else {
      return dispute.deadlineLabel;
    }

    // 4. Use the state variable 'now' instead of calling Date.now()
    const diff = targetDeadline - now;

    if (diff <= 0) return "Ended";

    const hours = Math.ceil(diff / 3600);

    if (hours > 24) {
      const days = Math.ceil(hours / 24);
      return `${days} days left`;
    }

    return `${hours}h left`;
  };

  const displayDispute = dispute
    ? {
        id: dispute.id.toString(),
        title: dispute.title || `Dispute #${dispute.id}`,
        category: dispute.category,
        status: statusLabels[dispute.status] || "Unknown",
        claimer: {
          name: dispute.claimerName || dispute.claimer,
          shortName: shortenAddress(dispute.claimerName || dispute.claimer),
          avatar: "/images/profiles-mockup/profile-1.jpg",
          isWinner:
            isFinished && winnerAddress === dispute.claimer.toLowerCase(),
        },
        defender: {
          name: dispute.defenderName || dispute.defender,
          shortName: shortenAddress(dispute.defenderName || dispute.defender),
          avatar: "/images/profiles-mockup/profile-2.jpg",
          isWinner:
            isFinished && winnerAddress === dispute.defender.toLowerCase(),
        },
        description: dispute.description || "No description provided.",
        deadlineLabel: getDeadlineLabel(), // Use new logic
        stake: dispute.stake,
      }
    : null;

  if (isLoading || !displayDispute) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
        <Loader2 className="animate-spin text-[#8c8fff] w-8 h-8" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen bg-[#F8F9FC] relative overflow-hidden touch-none"
      {...bindSwipe()}
    >
      {/* Background Decorative blob */}
      <div className="absolute -top-36 -left-24 w-72 h-72 bg-[#8c8fff]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* 1. Header & Title Section */}
      {/* Fixed padding/margin to match file page (px-4 instead of px-6) */}
      <div className="py-2 z-10">
        <DisputeOverviewHeader onBack={handleBack} />

        <div className="mt-6 mx-6 flex flex-col gap-4">
          {/* Badges Row */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#8c8fff] text-white text-[10px] font-extrabold uppercase tracking-wide shadow-sm shadow-[#8c8fff]/20">
              {displayDispute.category}
            </span>
            <div className="flex items-center gap-1.5 text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-[#8c8fff]" />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {displayDispute.deadlineLabel}
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-manrope font-extrabold text-[#1b1c23] leading-tight tracking-tight">
            {displayDispute.title}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-6 z-10 scrollbar-hide">
        {/* 2. Versus Card */}
        <div className="mt-2">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#8c8fff]" /> Parties Involved
            </h3>
          </div>

          {/* Canonical: rounded-[24px] -> rounded-3xl */}
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-white relative">
            <div className="flex items-stretch min-h-30">
              {/* Claimer (Left) */}
              {/* Canonical: rounded-l-[18px] -> rounded-l-2xl */}
              <div className="flex-1 bg-[#F8F9FC] rounded-l-2xl rounded-r-md p-4 flex flex-col items-center justify-center gap-2 text-center border border-transparent hover:border-blue-100 transition-colors">
                <div className="w-14 h-14 rounded-full border-[3px] border-white shadow-md overflow-hidden mb-1">
                  <img
                    src={displayDispute.claimer.avatar}
                    alt="Claimer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">
                    Claimer
                  </span>
                  <div className="max-w-[100px] sm:max-w-none mx-auto">
                    <span className="inline-block text-base font-bold text-[#1b1c23] bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm truncate w-full">
                      {displayDispute.claimer.shortName}
                    </span>
                  </div>
                </div>
              </div>

              {/* VS Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-[#1b1c23] w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-[4px] border-white text-white">
                  <span className="text-[10px] font-black italic pr-[1px]">
                    VS
                  </span>
                </div>
              </div>

              {/* Defender (Right) */}
              {/* Canonical: rounded-r-[18px] -> rounded-r-2xl */}
              <div className="flex-1 bg-[#F8F9FC] rounded-r-2xl rounded-l-md p-4 flex flex-col items-center justify-center gap-2 text-center border border-transparent hover:border-gray-200 transition-colors">
                <div className="w-14 h-14 rounded-full border-[3px] border-white shadow-md overflow-hidden mb-1">
                  <img
                    src={displayDispute.defender.avatar}
                    alt="Defender"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Defender
                  </span>
                  <div className="max-w-[100px] sm:max-w-none mx-auto">
                    <span className="inline-block text-base font-bold text-[#1b1c23] bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm truncate w-full">
                      {displayDispute.defender.shortName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Case Context */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8c8fff]" /> Case Brief
            </h3>
          </div>

          {/* Canonical: rounded-[24px] -> rounded-3xl */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8c8fff]/20 to-transparent" />

            <p className="text-base text-gray-600 leading-relaxed font-medium">
              {displayDispute.description}
            </p>

            <div className="mt-8 pt-5 border-t border-dashed border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8c8fff]/10 flex items-center justify-center text-[#8c8fff]">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                    Juror Stake
                  </span>
                  <span className="text-base font-black text-[#1b1c23]">
                    {displayDispute.stake} USDC
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                <span className="text-xs font-mono font-bold text-gray-500">
                  ID: #{displayDispute.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Case File Link */}
        <button
          onClick={handleOpenCaseFile}
          // Canonical: rounded-[20px] -> rounded-2xl
          className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#8c8fff]/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F8F9FC] flex items-center justify-center text-[#1b1c23]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-[#1b1c23] text-sm">
                Full Case File
              </h4>
              <p className="text-[11px] text-gray-400 font-medium">
                Browse all statements & evidence
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#1b1c23] group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* 4. Sticky Footer CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
        <button
          onClick={handleStartReview}
          // Canonical: rounded-[20px] -> rounded-2xl
          className="group w-full py-4 bg-[#1b1c23] text-white rounded-2xl font-manrope font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-gray-200 hover:bg-[#2c2d33] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Gavel className="w-5 h-5 fill-white/50" />
          Review Evidence
          <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-4">
          <PaginationDots currentIndex={0} total={4} />
        </div>
      </div>
    </div>
  );
}
