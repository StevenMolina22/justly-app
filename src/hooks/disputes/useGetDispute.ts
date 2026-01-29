import { useReadContract, useAccount } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { transformDisputeData, type DisputeUI } from "@/util/disputeAdapter";
import { useState, useEffect } from "react";
import { useStakingToken } from "../core/useStakingToken";
import { useContracts } from "../core/useContracts";

export function useGetDispute(id: string) {
  const { address } = useAccount();
  const { decimals } = useStakingToken();
  const { sliceContract } = useContracts();

  // 1. Fetch raw dispute data from the contract
  const {
    data: rawDispute,
    isLoading: isDisputeLoading,
    error,
    refetch,
  } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "disputes", // Matches your Solidity mapping
    args: [BigInt(id)],
    query: {
      enabled: !!id, // Only run if ID exists
      staleTime: 5000, // Cache for 5 seconds
    },
  });

  // 2. Fetch jurorStakes for the current user
  const { data: myStake, isLoading: isStakeLoading } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "jurorStakes",
    args: address ? [BigInt(id), address] : undefined,
    query: {
      enabled: !!id && !!address,
    },
  });

  const [transformedDispute, setTransformedDispute] =
    useState<DisputeUI | null>(null);

  // 3. Transform the data using your utility
  // Since transformDisputeData is async (fetches IPFS), we need a useEffect
  useEffect(() => {
    async function load() {
      if (!rawDispute) {
        setTransformedDispute(null);
        return;
      }
      try {
        // We pass the raw result to the transformer with the user's stake
        const transformed = await transformDisputeData(
          {
            ...(rawDispute as any),
            id,
          },
          decimals,
          false, // userHasRevealed (not critical for this view, or add fetch)
          undefined,
          myStake ? (myStake as bigint) : undefined,
        );
        setTransformedDispute(transformed);
      } catch (e) {
        console.error("Failed to transform dispute data", e);
      }
    }
    load();
  }, [rawDispute, myStake, id, decimals]);

  return {
    dispute: transformedDispute,
    loading: isDisputeLoading || isStakeLoading,
    error,
    refetch,
  };
}
