"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { DisputesHeader } from "@/components/disputes/DisputesHeader";
import { BalanceCard } from "@/components/disputes/BalanceCard";
import { DisputesList } from "@/components/disputes/DisputesList";

export default function DisputesPage() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);
  return (
    <div className="flex flex-col h-full w-full">
      <DisputesHeader />
      <BalanceCard />
      <DisputesList />
    </div>
  );
}
