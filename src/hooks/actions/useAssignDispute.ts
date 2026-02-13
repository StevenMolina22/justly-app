import { useState } from "react";
import {
  useWriteContract,
  usePublicClient,
  useAccount,
  useChainId,
} from "wagmi";
import { erc20Abi, parseUnits, parseEventLogs } from "viem";
import { SLICE_ABI, getContractsForChain } from "@/config/contracts";
import { appConfig } from "@/config/chains";
import { toast } from "sonner";
import { useStakingToken } from "../core/useStakingToken";
import { isBatchUnsupportedError, useBatchCalls } from "../core/useBatchCalls";
import { buildApproveCall, buildDrawDisputeCall } from "@/util/txCalls";

type DrawDisputeResult = {
  success: boolean;
  disputeId: number | null;
  path: "batch" | "sequential" | null;
};

export function useAssignDispute() {
  const [isDrawing, setIsDrawing] = useState(false);
  const {
    address: stakingToken,
    decimals,
    symbol,
    isLoading: isTokenLoading,
  } = useStakingToken();
  const { address } = useAccount();
  const chainId = useChainId();

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { sliceContract } = getContractsForChain(chainId);
  const { supportsAtomicBatch, sendAtomicCalls } = useBatchCalls();

  // New "Draw" Logic - Replaces findActiveDispute + joinDispute
  const drawDispute = async (amount: string): Promise<DrawDisputeResult> => {
    if (!address || !publicClient || !sliceContract) {
      toast.error("Wallet not connected");
      return { success: false, disputeId: null, path: null };
    }

    if (chainId !== appConfig.chain.id) {
      toast.error(`Wrong network. Switch to ${appConfig.chain.name}.`);
      return { success: false, disputeId: null, path: null };
    }

    try {
      setIsDrawing(true);
      const amountToStake = parseUnits(amount, decimals);

      console.log(`[Draft] Staking: ${amount} ${symbol} (${amountToStake})`);

      // 1. Check & Approve Allowance
      const getAllowance = async () => {
        return await publicClient.readContract({
          address: stakingToken,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, sliceContract],
        });
      };

      let allowance = await getAllowance();

      if (allowance < amountToStake) {
        let attemptedBatch = false;

        try {
          const canBatch = await supportsAtomicBatch();
          if (canBatch) {
            attemptedBatch = true;
            toast.info("Processing atomic draft transaction...");

            await sendAtomicCalls([
              buildApproveCall(stakingToken, sliceContract, amountToStake),
              buildDrawDisputeCall(sliceContract, amountToStake),
            ]);
            toast.success("Drafted successfully!");
            return { success: true, disputeId: null, path: "batch" };
          }
        } catch (batchError) {
          if (!attemptedBatch || !isBatchUnsupportedError(batchError)) {
            throw batchError;
          }
        }

        toast.info("Approving Stake...");
        const approveHash = await writeContractAsync({
          address: stakingToken,
          abi: erc20Abi,
          functionName: "approve",
          args: [sliceContract, amountToStake],
        });

        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        let retries = 0;
        while (allowance < amountToStake && retries < 10) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          allowance = await getAllowance();
          retries++;
        }

        if (allowance < amountToStake) {
          toast.warning("Network lagging. Waiting for approval sync...");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          toast.success("Approval confirmed.");
        }
      }

      // 2. Execute Draw
      // Now safe to simulate because we verified the node sees the allowance
      toast.info("Entering the Draft Pool...");
      const hash = await writeContractAsync({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "drawDispute",
        args: [amountToStake],
      });

      toast.info("Drafting in progress...");

      // 3. Wait for Receipt & Parse Logs
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Parse the 'JurorJoined' event to find which ID we got
      const logs = parseEventLogs({
        abi: SLICE_ABI,
        eventName: "JurorJoined",
        logs: receipt.logs,
      });

      if (logs.length > 0) {
        // The event args: { id, juror }
        const assignedId = Number(logs[0].args.id);
        toast.success(`Drafted into Dispute #${assignedId}!`);
        return { success: true, disputeId: assignedId, path: "sequential" };
      } else {
        // Fallback if event isn't found (rare)
        toast.warning(
          "Draft complete, but could not detect ID. Check your profile.",
        );
        return { success: true, disputeId: null, path: "sequential" };
      }
    } catch (error: unknown) {
      console.error("Draft failed", error);
      const err = error as { shortMessage?: string; message?: string };
      const msg = err.shortMessage || err.message || "Unknown error";
      toast.error(`Draft failed: ${msg}`);
      return { success: false, disputeId: null, path: null };
    } finally {
      setIsDrawing(false);
    }
  };

  return {
    drawDispute,
    isLoading: isDrawing,
    // Only ready when wallet is connected AND staking token metadata is loaded
    isReady: !!address && !isTokenLoading && !!stakingToken,
  };
}
