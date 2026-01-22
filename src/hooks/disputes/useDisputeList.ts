import { useReadContract, useReadContracts } from "wagmi";
import { DISPUTE_STATUS } from "@/config/app";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import { transformDisputeData, type DisputeUI } from "@/util/disputeAdapter";
import { useMemo, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useStakingToken } from "../core/useStakingToken";

// "juror" = disputes where I am a juror
// "mine"  = disputes where I am a juror OR a party (Claimer/Defender)
// "all"   = all disputes (admin/explorer view)
type ListType = "juror" | "mine" | "all";

export type Dispute = DisputeUI;

export function useDisputeList(
  listType: ListType,
  options?: { activeOnly?: boolean },
) {
  const { address } = useAccount();
  const { decimals } = useStakingToken();
  const { sliceContract } = useContracts();

  // 1. Fetch Juror Disputes
  const { data: jurorDisputeIds } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "getJurorDisputes",
    args: address ? [address] : undefined,
    query: {
      enabled: (listType === "juror" || listType === "mine") && !!address,
    },
  });

  // 2. Fetch User Disputes (Only for "mine")
  const { data: userDisputeIds } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "getUserDisputes",
    args: address ? [address] : undefined,
    query: {
      enabled: listType === "mine" && !!address,
    },
  });

  const { data: totalCount } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "disputeCount",
    query: { enabled: listType === "all" },
  });

  // 3. Prepare Calls
  const calls = useMemo(() => {
    const contracts = [];
    let idsToFetch: bigint[] = [];

    // REMOVED: Redundant 'if (listType === "juror")' block that was causing duplicates.
    // We only keep the logic for "all" here because it relies on a count/range
    // rather than a specific ID list which is handled below.

    if (listType === "all" && totalCount) {
      const total = Number(totalCount);

      const start = total;
      const end = Math.max(1, total - 20 + 1); // Ensure we stop at 1, and get max 20 items

      for (let i = start; i >= end; i--) {
        contracts.push({
          address: sliceContract,
          abi: SLICE_ABI,
          functionName: "disputes",
          args: [BigInt(i)],
        });
      }
    }

    // "juror" mode: Strictly juror IDs
    if (listType === "juror" && jurorDisputeIds) {
      idsToFetch = [...(jurorDisputeIds as bigint[])];
    }
    // "mine" mode: Juror + Party IDs
    else if (listType === "mine") {
      const jIds = (jurorDisputeIds as bigint[]) || [];
      const uIds = (userDisputeIds as bigint[]) || [];
      const uniqueIds = new Set([...jIds, ...uIds].map((id) => id.toString()));
      idsToFetch = Array.from(uniqueIds).map((id) => BigInt(id));
    }

    // Sort descending
    idsToFetch.sort((a, b) => Number(b) - Number(a));

    for (const id of idsToFetch) {
      contracts.push({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "disputes",
        args: [id],
      });
    }

    return contracts;
  }, [listType, jurorDisputeIds, userDisputeIds, totalCount, sliceContract]);

  // 4. Fetch Data
  const {
    data: results,
    isLoading: isMulticallLoading,
    refetch,
  } = useReadContracts({
    contracts: calls,
    query: { enabled: calls.length > 0 },
  });

  const [disputes, setDisputes] = useState<DisputeUI[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  // 5. Process & Filter
  useEffect(() => {
    async function process() {
      if (!results || results.length === 0) {
        if (!isMulticallLoading) {
          setDisputes([]);
          setIsProcessing(false);
        }
        return;
      }

      setIsProcessing(true);
      const processed = await Promise.all(
        results.map(async (result) => {
          if (result.status !== "success") return null;
          return await transformDisputeData(result.result, decimals);
        }),
      );

      let finalDisputes = processed.filter((d): d is DisputeUI => d !== null);

      // --- Filter out Finished AND Unpaid disputes if activeOnly is true ---
      if (options?.activeOnly) {
        finalDisputes = finalDisputes.filter((d) => {
          // Exclude Resolved (3) AND Created/Unpaid (0)
          // We only want Active phases: Commit (1) and Reveal (2)
          return (
            d.status !== DISPUTE_STATUS.RESOLVED &&
            d.status !== DISPUTE_STATUS.CREATED
          );
        });
      }

      setDisputes(finalDisputes);
      setIsProcessing(false);
    }

    process();
  }, [results, isMulticallLoading, options?.activeOnly, decimals]);

  return { disputes, isLoading: isMulticallLoading || isProcessing, refetch };
}
