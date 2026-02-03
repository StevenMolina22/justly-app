"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { CaseFileView } from "@/components/dispute/CaseFileView";
import { Loader2 } from "lucide-react";
import { useHeader } from "@/lib/hooks/useHeader";

export default function CaseFilePage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { dispute, loading } = useGetDispute(id);

  // Configure header
  useHeader({
    title: `Case #${id}`,
  });

  if (loading || !dispute) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-[#8c8fff] w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden pt-4">
        <CaseFileView dispute={dispute} />
      </div>
    </div>
  );
}
