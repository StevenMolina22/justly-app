import { useReadContract, useReadContracts } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { erc20Abi } from "viem";
import { useContracts } from "./useContracts";

export function useStakingToken() {
  const { sliceContract } = useContracts();

  // Fetch the staking token address from the protocol contract
  const { data: tokenAddress } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "stakingToken",
  });

  // Fetch Metadata (Decimals, Symbol) from the Token contract
  const { data: tokenMetadata, isLoading } = useReadContracts({
    contracts: [
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
      },
    ],
    query: { enabled: !!tokenAddress },
  });

  return {
    address: tokenAddress as `0x${string}`,
    decimals: tokenMetadata?.[0]?.result ?? 6, // Fallback to 6 (USDC decimals)
    symbol: tokenMetadata?.[1]?.result ?? "TOKEN",
    isLoading,
  };
}
