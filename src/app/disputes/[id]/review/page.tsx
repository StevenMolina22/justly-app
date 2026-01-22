"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { CaseFileView } from "@/components/dispute/CaseFileView";
import { Loader2, ArrowRight, Gavel } from "lucide-react";
import { PaginationDots } from "@/components/dispute-overview/PaginationDots";

export default function JurorReviewPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { dispute, loading } = useGetDispute(id);

  if (loading || !dispute) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
        <Loader2 className="animate-spin text-[#8c8fff] w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FC]">
      {/* 1. Header */}
      <div className="px-4 pt-4 z-10 bg-[#F8F9FC]">
        <DisputeOverviewHeader
          onBack={() => router.back()}
          title="Review Evidence"
        />
      </div>

      {/* 2. Main Content (The Reusable Component) */}
      <div className="flex-1 overflow-hidden pt-4 relative">
        <CaseFileView dispute={dispute} defaultTab="claimant" />

        {/* 3. Floating Action Footer (Juror Only) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
          <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
            <button
              onClick={() => router.push(`/disputes/${id}/vote`)}
              className="group w-full py-4 bg-[#1b1c23] text-white rounded-[20px] font-manrope font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-gray-200 hover:bg-[#2c2d33] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Gavel className="w-5 h-5 fill-white/50" />
              Proceed to Vote
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex justify-center">
              {/* Pagination Context: Overview(0) -> Review(1) -> Vote(2) -> Reveal(3) */}
              <PaginationDots currentIndex={1} total={4} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
