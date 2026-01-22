import { useReadContract, useAccount } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { useStakingToken } from "./useStakingToken";

export function useTokenBalance() {
  const { address } = useAccount();
  const { address: stakingToken, decimals } = useStakingToken();

  const {
    data: balance,
    isLoading,
    refetch,
  } = useReadContract({
    address: stakingToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!stakingToken,
    },
  });

  return {
    value: balance, // BigInt
    formatted: balance ? formatUnits(balance, decimals) : "0",
    loading: isLoading,
    refetch,
  };
}
