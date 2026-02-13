import { SLICE_ABI } from "@/config/contracts";
import { encodeFunctionData, erc20Abi } from "viem";

export type BatchTxCall = {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
};

export function buildApproveCall(
  tokenAddress: `0x${string}`,
  spender: `0x${string}`,
  amount: bigint,
): BatchTxCall {
  return {
    to: tokenAddress,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount],
    }),
    value: 0n,
  };
}

export function buildPayDisputeCall(
  sliceContract: `0x${string}`,
  disputeId: bigint,
): BatchTxCall {
  return {
    to: sliceContract,
    data: encodeFunctionData({
      abi: SLICE_ABI,
      functionName: "payDispute",
      args: [disputeId],
    }),
    value: 0n,
  };
}

export function buildDrawDisputeCall(
  sliceContract: `0x${string}`,
  amountToStake: bigint,
): BatchTxCall {
  return {
    to: sliceContract,
    data: encodeFunctionData({
      abi: SLICE_ABI,
      functionName: "drawDispute",
      args: [amountToStake],
    }),
    value: 0n,
  };
}
