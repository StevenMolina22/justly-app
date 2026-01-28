import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";

export function useNativeBalance() {
  const { address } = useAccount();
  
  // Fetch native coin balance (ETH on Base)
  const { data, isLoading } = useBalance({ address });

  // Threshold: 0.001 ETH (~$2-3) is a safe buffer for Base
  const MIN_GAS_THRESHOLD = 0.001;

  const rawBalance = data?.value ?? 0n;
  const formatted = data ? formatEther(data.value) : "0";
  const numBalance = parseFloat(formatted);

  const isLowGas = !isLoading && numBalance < MIN_GAS_THRESHOLD && numBalance > 0;
  const isZeroGas = !isLoading && numBalance === 0;

  return {
    balance: rawBalance,
    formatted: Number(formatted).toFixed(4),
    symbol: data?.symbol ?? "ETH",
    isLoading,
    isLowGas,
    isZeroGas,
  };
}
