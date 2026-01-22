"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { CaseFileView } from "@/components/dispute/CaseFileView";
import { Loader2 } from "lucide-react";

export default function CaseFilePage() {
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
      {/* Header */}
      <div className="px-4 pt-4 z-10 bg-[#F8F9FC]">
        <DisputeOverviewHeader
          onBack={() => router.back()}
          title={`Case #${id}`}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden pt-4">
        <CaseFileView dispute={dispute} />
      </div>
    </div>
  );
}
