import { appConfig } from "./chains";
import { sliceAbi } from "@/contracts/slice-abi";

export const SLICE_ABI = sliceAbi;

export const getContractsForChain = (chainId: number) => {
  // Safety check: Warn if we are trying to use contracts on the wrong chain
  if (chainId !== appConfig.chain.id) {
    console.warn(
      `Chain ID mismatch! Current env is ${appConfig.chain.name} (${appConfig.chain.id}), but requested ${chainId}`,
    );
  }

  // Return the single source of truth for the current environment
  return {
    sliceContract: appConfig.contracts.slice as `0x${string}`,
  };
};
