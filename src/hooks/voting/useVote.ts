import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { useSliceVoting } from "@/hooks/voting/useSliceVoting";
import { useAccount, useChainId } from "wagmi";
import { getVoteData } from "@/util/votingStorage";
import { getContractsForChain } from "@/config/contracts";

import { DISPUTE_STATUS } from "@/config/app";

export function useVote(disputeId: string) {
  const chainId = useChainId();
  const { address } = useAccount();
  const { sliceContract } = getContractsForChain(chainId);

  // Local state
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [hasCommittedLocally, setHasCommittedLocally] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Contract & Data hooks
  const { dispute, refetch } = useGetDispute(disputeId);
  const { commitVote, isProcessing, logs } = useSliceVoting();

  // Load vote from local storage
  useEffect(() => {
    if (typeof window !== "undefined" && address) {
      const stored = getVoteData(sliceContract, disputeId, address);

      if (stored) {
        setHasCommittedLocally(true);
        setSelectedVote(stored.vote);
      } else {
        setHasCommittedLocally(false);
        setSelectedVote(null);
      }
    }
  }, [address, disputeId, sliceContract]);

  // Actions
  const handleVoteSelect = useCallback(
    (vote: number) => {
      if (hasCommittedLocally) return;
      setSelectedVote((prevVote) => (prevVote === vote ? null : vote));
    },
    [hasCommittedLocally],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [refetch]);

  const handleCommit = useCallback(async () => {
    if (selectedVote === null) return false;

    const success = await commitVote(disputeId, selectedVote);

    if (success) {
      setHasCommittedLocally(true);
      toast.success("Vote committed! Refreshing status...");
      
      // Add propagation delay to allow RPC indexing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      await handleRefresh();
      return true;
    }
    return false;
  }, [disputeId, selectedVote, commitVote, handleRefresh]);

  // Derived State
  const currentStatus = dispute?.status;
  const isCommitPhase = currentStatus === DISPUTE_STATUS.COMMIT;
  const isRevealPhase = currentStatus === DISPUTE_STATUS.REVEAL;

  const isCommitDisabled =
    isProcessing ||
    selectedVote === null ||
    hasCommittedLocally ||
    !isCommitPhase;

  const isRevealDisabled = !isRevealPhase;

  return {
    dispute,
    selectedVote,
    hasCommittedLocally,
    isRefreshing,
    isProcessing,
    logs,
    isCommitPhase,
    isRevealPhase,
    isCommitDisabled,
    isRevealDisabled,
    handleVoteSelect,
    handleCommit,
    handleRefresh,
  };
}
