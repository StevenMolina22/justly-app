"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { DisputesHeader } from "@/components/disputes/DisputesHeader";
import { BalanceCard } from "@/components/disputes/BalanceCard";
import { DisputesList } from "@/components/disputes/DisputesList";
import { Scale } from "lucide-react";

export default function DisputesPage() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);
  return (
    <div className="flex flex-col h-full w-full">
      <DisputesHeader />
      <BalanceCard />
      {/* Section Header */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Scale className="w-4 h-4 text-[#8c8fff]" />
          <h3 className="text-base font-bold text-[#1b1c23]">
            Explore Disputes
          </h3>
        </div>
      </div>
      {/* Public Disputes Feed */}
      <DisputesList mode="all" options={{ activeOnly: true }} />
    </div>
  );
}
