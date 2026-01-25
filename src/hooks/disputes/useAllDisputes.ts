import { useReadContract, useReadContracts } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import {
  transformDisputeData,
  batchFetchIPFSMetadata,
  type DisputeUI,
} from "@/util/disputeAdapter";
import { useMemo, useState, useEffect } from "react";
import { useStakingToken } from "../core/useStakingToken";

export function useAllDisputes() {
  const { decimals } = useStakingToken();
  const { sliceContract } = useContracts();
  // 1. Get the total number of disputes
  const { data: countData } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "disputeCount",
  });

  // 2. Calculate the latest 20 IDs (e.g., 50, 49, 48...)
  const calls = useMemo(() => {
    // FIX: Check for undefined explicitly. '0n' is falsy, so !countData triggers incorrectly on 0.
    if (countData === undefined) return [];

    const total = Number(countData);
    if (total === 0) return []; // Explicitly return empty if 0 disputes

    const start = total;
    const end = Math.max(1, total - 20 + 1); // Fetch last 20
    const contracts = [];

    for (let i = start; i >= end; i--) {
      contracts.push({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "disputes",
        args: [BigInt(i)],
      });
    }
    return contracts;
  }, [countData, sliceContract]);

  // 3. Fetch data for those IDs
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

  // 4. Transform Data (IPFS, etc.)
  useEffect(() => {
    async function process() {
      // Immediate exit if we know count is 0
      if (countData !== undefined && Number(countData) === 0) {
        setDisputes([]);
        setIsProcessing(false);
        return;
      }

      if (!results) {
        // Ensure we stop loading if countData is defined (even if 0, though caught above)
        if (!isMulticallLoading && countData !== undefined)
          setIsProcessing(false);
        return;
      }

      setIsProcessing(true);

      // Extract all IPFS hashes from successful results
      const ipfsHashes = results
        .filter((r) => r.status === "success")
        .map((r) => {
          const data = r.result as any;
          return data?.ipfsHash || data?.[6] || "";
        });

      // Batch fetch all IPFS metadata in parallel (eliminates waterfall)
      const ipfsDataMap = await batchFetchIPFSMetadata(ipfsHashes);

      // Transform disputes with pre-fetched metadata
      const processed = await Promise.all(
        results.map(async (result) => {
          if (result.status !== "success") return null;
          const data = result.result as any;
          const ipfsHash = data?.ipfsHash || data?.[6] || "";
          const prefetchedMeta = ipfsHash ? ipfsDataMap.get(ipfsHash) : undefined;
          return await transformDisputeData(
            result.result,
            decimals,
            false,
            prefetchedMeta
          );
        })
      );

      setDisputes(processed.filter((d): d is DisputeUI => d !== null));
      setIsProcessing(false);
    }
    process();
  }, [results, isMulticallLoading, countData, decimals]);

  return { disputes, isLoading: isMulticallLoading || isProcessing, refetch };
}
