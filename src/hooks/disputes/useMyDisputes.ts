import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import {
  transformDisputeData,
  batchFetchIPFSMetadata,
  type DisputeUI,
} from "@/util/disputeAdapter";
import { useMemo, useState, useEffect } from "react";
import { useStakingToken } from "../core/useStakingToken";

export function useMyDisputes() {
  const { address } = useAccount();
  const { decimals } = useStakingToken();
  const { sliceContract } = useContracts();

  // 1. Fetch IDs
  // We rely on the smart contract fix (userDisputes[_config.claimer])
  // so these standard calls will now work correctly.
  const { data: jurorIds, isLoading: loadJuror } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "getJurorDisputes",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: userIds, isLoading: loadUser } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "getUserDisputes",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // 2. Merge & Deduplicate IDs
  const sortedIds = useMemo(() => {
    const jIds = (jurorIds as bigint[]) || [];
    const uIds = (userIds as bigint[]) || [];

    const unique = Array.from(
      new Set([...jIds, ...uIds].map((id) => id.toString())),
    );

    return unique.map(BigInt).sort((a, b) => Number(b) - Number(a));
  }, [jurorIds, userIds]);

  // 3. Prepare Multicall for disputes
  const disputeCalls = useMemo(() => {
    return sortedIds.map((id) => ({
      address: sliceContract,
      abi: SLICE_ABI,
      functionName: "disputes",
      args: [id],
    }));
  }, [sortedIds, sliceContract]);

  // 3b. Prepare Multicall for hasRevealed status
  const revealCalls = useMemo(() => {
    if (!address) return [];
    return sortedIds.map((id) => ({
      address: sliceContract,
      abi: SLICE_ABI,
      functionName: "hasRevealed",
      args: [id, address],
    }));
  }, [sortedIds, sliceContract, address]);

  const { data: results, isLoading: loadMulti } = useReadContracts({
    contracts: disputeCalls,
    query: { enabled: sortedIds.length > 0 },
  });

  const { data: revealResults, isLoading: loadReveal } = useReadContracts({
    contracts: revealCalls,
    query: { enabled: revealCalls.length > 0 },
  });

  const [disputes, setDisputes] = useState<DisputeUI[]>([]);

  // 4. Transform Data
  useEffect(() => {
    // If results is undefined/null, handle empty state or return
    if (!results) {
      if (!loadMulti && sortedIds.length === 0) setDisputes([]);
      return;
    }

    // FIX: Capture 'results' into a local const to satisfy TypeScript's
    // narrowing inside the async closure below.
    const currentResults = results;
    const currentRevealResults = revealResults;

    async function process() {
      // Extract all IPFS hashes from successful results
      const ipfsHashes = currentResults
        .filter((r) => r.status === "success")
        .map((r) => {
          const data = r.result as any;
          return data?.ipfsHash || data?.[6] || "";
        });

      // Batch fetch all IPFS metadata in parallel (eliminates waterfall)
      const ipfsDataMap = await batchFetchIPFSMetadata(ipfsHashes);

      // Transform disputes with pre-fetched metadata
      const processed = await Promise.all(
        currentResults.map(async (res, idx) => {
          if (res.status !== "success") return null;

          // Inject ID manually to be safe
          const id = sortedIds[idx].toString();
          const data = res.result as any;
          const ipfsHash = data?.ipfsHash || data?.[6] || "";

          // Get reveal status for this dispute
          const userHasRevealed =
            currentRevealResults?.[idx]?.status === "success"
              ? Boolean(currentRevealResults[idx].result)
              : false;

          const prefetchedMeta = ipfsHash ? ipfsDataMap.get(ipfsHash) : undefined;

          return await transformDisputeData(
            { ...(res.result as any), id },
            decimals,
            userHasRevealed,
            prefetchedMeta
          );
        })
      );
      setDisputes(processed.filter((d): d is DisputeUI => d !== null));
    }
    process();
  }, [results, revealResults, decimals, sortedIds, loadMulti]);

  return {
    disputes,
    isLoading: loadJuror || loadUser || loadMulti || loadReveal,
  };
}
