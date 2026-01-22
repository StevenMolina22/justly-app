"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { DisputeListView } from "./DisputeListView";
import { useAccount } from "wagmi";
import ConnectButton from "../ConnectButton";
import { useDisputeList } from "@/hooks/disputes/useDisputeList";

interface DisputesListProps {
  /**
   * "all" = Public feed (Home) - shows all disputes in the protocol
   * "juror" = Only disputes where user is assigned as juror
   * "mine" = User's created disputes + juror assignments
   */
  mode?: "all" | "juror" | "mine";
  /**
   * Optional filters to pass to the hook
   */
  options?: {
    activeOnly?: boolean;
  };
}

export const DisputesList: React.FC<DisputesListProps> = ({
  mode = "juror",
  options,
}) => {
  const router = useRouter();
  const { isConnected } = useAccount();

  // 2. Pass the options directly to the hook
  // Your hook already handles the logic to filter out RESOLVED (status 3) disputes
  const { disputes, isLoading } = useDisputeList(mode, options);

  // For "juror" and "mine" modes, require wallet connection
  // For "all" mode, show public disputes without requiring connection
  if (mode !== "all" && !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
        <h3 className="text-lg font-bold text-[#1b1c23] mb-2">
          Connect to see your cases
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          You need to connect your wallet to view your active disputes.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <DisputeListView
      disputes={disputes}
      isLoading={isLoading}
      onEarnClick={() => router.push("/juror/stake")}
    />
  );
};
