import { useState } from "react";
import { useWriteContract, usePublicClient } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import { toast } from "sonner";

export function useExecuteRuling() {
  const { sliceContract } = useContracts();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [isExecuting, setIsExecuting] = useState(false);

  // Return Promise<boolean> for cleaner control flow
  const executeRuling = async (disputeId: string | number): Promise<boolean> => {
    try {
      setIsExecuting(true);
      console.log(`Executing ruling for dispute #${disputeId}...`);

      const hash = await writeContractAsync({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "executeRuling",
        args: [BigInt(disputeId)],
      });

      toast.info("Transaction sent. Waiting for confirmation...");

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success("Ruling executed successfully!");
      return true; // Explicitly return true on success
    } catch (err: any) {
      console.error("Execution Error:", err);
      const msg =
        err.reason || err.shortMessage || err.message || "Unknown error";
      toast.error(`Execution Failed: ${msg}`);
      return false; // Return false on failure
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    executeRuling,
    isExecuting,
  };
}
