"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useMyDisputes } from "@/hooks/disputes/useMyDisputes";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import {
  Plus,
  Loader2,
  FileText,
  Coins,
  Gavel,
  Briefcase,
  UploadCloud,
} from "lucide-react";
import { DisputeUI } from "@/util/disputeAdapter";

export default function DisputeManagerPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { disputes, isLoading } = useMyDisputes();

  // Filter: Only show disputes where I am Claimer or Defender
  const myCases = useMemo(() => {
    if (!address) return [];
    return disputes.filter(
      (d) =>
        d.claimer.toLowerCase() === address.toLowerCase() ||
        d.defender.toLowerCase() === address.toLowerCase(),
    );
  }, [disputes, address]);

  const handleCreate = () => router.push("/disputes/create");

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FC] font-manrope">
      {/* Header */}
      <div className="px-4 pt-4 z-10">
        <DisputeOverviewHeader
          onBack={() => router.back()}
          title="Dispute Manager"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4 pt-6">
        {/* Intro */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#1b1c23]">My Cases</h1>
            <p className="text-sm text-gray-400 font-medium">
              Manage your active disputes
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="w-12 h-12 rounded-full bg-[#1b1c23] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#8c8fff]" />
          </div>
        ) : myCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Cases Found</h3>
            <p className="text-xs text-gray-500 max-w-[200px]">
              You haven&apos;t created or been added to any disputes yet.
            </p>
            <button
              onClick={handleCreate}
              className="mt-6 text-[#8c8fff] font-bold text-sm hover:underline"
            >
              Create your first case
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {myCases.map((dispute) => (
              <ManagerCaseCard
                key={dispute.id}
                dispute={dispute}
                address={address}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for individual case logic
const ManagerCaseCard = ({
  dispute,
  address,
}: {
  dispute: DisputeUI;
  address?: string;
}) => {
  const router = useRouter();

  // FIX: Store 'now' in state to ensure purity during render
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  // Determine Role
  const isClaimer = dispute.claimer.toLowerCase() === address?.toLowerCase();
  const roleLabel = isClaimer ? "Claimer" : "Defender";

  // Determine Action
  let ActionBtn = null;

  // 1. Unpaid -> Pay
  if (dispute.status === 0) {
    const iPaid = isClaimer ? dispute.claimerPaid : dispute.defenderPaid;
    if (!iPaid) {
      ActionBtn = (
        <button
          onClick={() => router.push(`/disputes/${dispute.id}/pay`)}
          className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <Coins className="w-3.5 h-3.5" /> Pay Stake ({dispute.stake} USDC)
        </button>
      );
    } else {
      ActionBtn = (
        <div className="w-full py-3 bg-gray-50 text-gray-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Waiting for Opponent
        </div>
      );
    }
  }
  // 2. Active -> Evidence
  // Assuming status 1 (Commit) allows evidence. Check your contract logic.
  // Usually evidence is allowed until 'evidenceDeadline'.
  else if (dispute.status === 1 || dispute.status === 2) {
    // FIX: Use the state-based 'now' instead of calling Date.now() directly
    const canSubmit =
      now > 0 && now / 1000 < (dispute.evidenceDeadline || Infinity);

    if (canSubmit) {
      ActionBtn = (
        <button
          onClick={() => router.push(`/disputes/${dispute.id}/evidence/submit`)}
          className="w-full py-3 bg-[#1b1c23] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <UploadCloud className="w-3.5 h-3.5" /> Submit Additional Evidence
        </button>
      );
    }
  }
  // 3. Finished -> Execute
  else if (dispute.status === 3 && dispute.phase === "CLOSED") {
    ActionBtn = (
      <button
        onClick={() => router.push(`/disputes/${dispute.id}/execute`)}
        className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
      >
        <Gavel className="w-3.5 h-3.5" /> Execute Ruling
      </button>
    );
  }

  return (
    <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[10px] font-bold">
              #{dispute.id}
            </span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase">
              {roleLabel}
            </span>
          </div>
          <h3 className="font-bold text-[#1b1c23] line-clamp-1">
            {dispute.title}
          </h3>
        </div>
        <button onClick={() => router.push(`/disputes/${dispute.id}`)}>
          <FileText className="w-5 h-5 text-gray-300 hover:text-[#8c8fff]" />
        </button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
        <div
          className={`w-2 h-2 rounded-full ${dispute.status === 3 ? "bg-emerald-500" : "bg-[#8c8fff]"}`}
        />
        Status: {dispute.phase}
      </div>

      {ActionBtn}
    </div>
  );
};
