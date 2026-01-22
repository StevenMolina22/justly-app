import { useChainId } from "wagmi";
import { getContractsForChain } from "@/config/contracts";

export function useContracts() {
  // 1. Get the active chain ID from Wagmi
  // - On Beexo, this will automatically be 8453 (Base)
  // - On Web, this will be 84532 (Base Sepolia)
  const chainId = useChainId();

  // 2. Resolve the correct address dynamically
  const { sliceContract } = getContractsForChain(chainId);

  return {
    sliceContract,
    chainId,
  };
}
