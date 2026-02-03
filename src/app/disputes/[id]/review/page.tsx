"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { CaseFileView } from "@/components/dispute/CaseFileView";
import { Loader2, ArrowRight, Gavel } from "lucide-react";
import { useHeader } from "@/lib/hooks/useHeader";

export default function JurorReviewPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { dispute, loading } = useGetDispute(id);

  // Configure header
  useHeader({
    title: "Review Evidence",
  });

  if (loading || !dispute) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-[#8c8fff] w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      {/* 2. Main Content (The Reusable Component) */}
      <div className="flex-1 overflow-hidden">
        <CaseFileView dispute={dispute} defaultTab="claimant" />
      </div>

      {/* 3. Action Footer */}
      <div className="shrink-0 p-6 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
          <button
            onClick={() => router.push(`/disputes/${id}/vote`)}
            className="group w-full py-4 bg-[#1b1c23] text-white rounded-2xl font-manrope font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-gray-200 hover:bg-[#2c2d33] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Gavel className="w-5 h-5 fill-white/50" />
            Proceed to Vote
            <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
