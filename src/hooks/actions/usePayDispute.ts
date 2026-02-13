import { useState } from "react";
import {
  useWriteContract,
  usePublicClient,
  useAccount,
  useChainId,
} from "wagmi";
import { parseUnits, erc20Abi } from "viem";
import { SLICE_ABI, getContractsForChain } from "@/config/contracts";
import { appConfig } from "@/config/chains";
import { toast } from "sonner";
import { useStakingToken } from "../core/useStakingToken";
import { isBatchUnsupportedError, useBatchCalls } from "../core/useBatchCalls";
import { buildApproveCall, buildPayDisputeCall } from "@/util/txCalls";

export function usePayDispute() {
  const { address } = useAccount();
  const { address: stakingToken, decimals } = useStakingToken();
  const chainId = useChainId();

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { supportsAtomicBatch, sendAtomicCalls } = useBatchCalls();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "approving" | "paying">("idle");

  const payDispute = async (disputeId: string | number, amountStr: string) => {
    if (!address || !publicClient) {
      toast.error("Wallet not connected");
      return false;
    }

    if (chainId !== appConfig.chain.id) {
      toast.error(`Wrong network. Switch to ${appConfig.chain.name}.`);
      return false;
    }

    try {
      setLoading(true);

      const { sliceContract } = getContractsForChain(chainId);

      const amountBI = parseUnits(amountStr, decimals);

      // We check allowance first to avoid redundant approval
      const allowance = await publicClient.readContract({
        address: stakingToken,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address, sliceContract],
      });

      const needsApproval = allowance < amountBI;
      console.info("[Batch][Pay] allowance check", {
        allowance: allowance.toString(),
        amount: amountBI.toString(),
        needsApproval,
      });

      if (needsApproval) {
        let attemptedBatch = false;

        try {
          const canBatch = await supportsAtomicBatch();
          console.info("[Batch][Pay] capability", { canBatch });
          if (canBatch) {
            attemptedBatch = true;
            setStep("paying");
            toast.info("Processing atomic transaction...");

            await sendAtomicCalls([
              buildApproveCall(stakingToken, sliceContract, amountBI),
              buildPayDisputeCall(sliceContract, BigInt(disputeId)),
            ]);

            toast.success("Payment successful!");
            return true;
          }
        } catch (batchError) {
          if (!attemptedBatch || !isBatchUnsupportedError(batchError)) {
            throw batchError;
          }
          console.info("[Batch][Pay] falling back to sequential flow", batchError);
        }

        setStep("approving");
        toast.info("Approving tokens...");

        const approveHash = await writeContractAsync({
          address: stakingToken,
          abi: erc20Abi,
          functionName: "approve",
          args: [sliceContract, amountBI],
        });

        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        toast.success("Approval confirmed.");
      }

      setStep("paying");
      toast.info("Paying dispute...");

      const payHash = await writeContractAsync({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "payDispute",
        args: [BigInt(disputeId)],
      });

      // Wait for payment to be mined
      await publicClient.waitForTransactionReceipt({ hash: payHash });

      toast.success("Payment successful!");
      return true;
    } catch (error: any) {
      console.error("Payment flow failed", error);
      const msg =
        error.reason || error.shortMessage || error.message || "Unknown error";
      toast.error(`Payment failed: ${msg}`);
      return false;
    } finally {
      setLoading(false);
      setStep("idle");
    }
  };

  return {
    payDispute,
    isPaying: loading,
    step,
  };
}
