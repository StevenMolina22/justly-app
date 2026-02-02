"use client";

import { useState } from "react";
import { useSendTransaction, usePublicClient, useAccount } from "wagmi";
import { parseEther, isAddress } from "viem";
import { toast } from "sonner";

export function useSendNative(onSuccess?: () => void) {
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);

  const sendNative = async (recipient: string, amount: string) => {
    // Basic Validation
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }
    if (!isAddress(recipient)) {
      toast.error("Invalid recipient address");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Invalid amount");
      return;
    }

    setIsLoading(true);
    try {
      const value = parseEther(amount);

      toast.info("Sending transaction...");

      // Execute
      const hash = await sendTransactionAsync({
        to: recipient,
        value: value,
      });

      // Wait
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success("Transfer successful!");
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.reason || err.shortMessage || err.message || "Transaction failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { sendNative, isLoading };
}
