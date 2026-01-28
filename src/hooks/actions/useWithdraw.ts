"use client";

import { useState } from "react";
import {
  useWriteContract,
  usePublicClient,
  useReadContract,
  useAccount,
} from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "../core/useContracts";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useStakingToken } from "../core/useStakingToken";

export function useWithdraw() {
  const { address } = useAccount();
  const { sliceContract: SLICE_ADDRESS } = useContracts();
  const {
    address: stakingToken,
    decimals,
    symbol: _symbol,
  } = useStakingToken();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Read claimable balance
  const { data: balance, refetch } = useReadContract({
    address: SLICE_ADDRESS,
    abi: SLICE_ABI,
    functionName: "balances",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const claimableAmount = balance
    ? formatUnits(balance as bigint, decimals)
    : "0";
  const hasFunds = balance ? (balance as bigint) > 0n : false;

  const withdraw = async () => {
    if (!stakingToken) {
      toast.error("Token address not found");
      return;
    }

    try {
      setIsWithdrawing(true);
      toast.info("Initiating withdrawal...");

      const hash = await writeContractAsync({
        address: SLICE_ADDRESS,
        abi: SLICE_ABI,
        functionName: "withdraw",
        args: [stakingToken as `0x${string}`],
      });

      toast.info("Transaction sent...");

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // Success is handled by the animation overlay in the component
      refetch(); // Update balance UI
      return true;
    } catch (err: any) {
      console.error("Withdraw error", err);
      toast.error(`Withdraw failed: ${err.shortMessage || err.message}`);
      return false;
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    withdraw,
    isWithdrawing,
    claimableAmount,
    hasFunds,
    refetchBalance: refetch,
  };
}
