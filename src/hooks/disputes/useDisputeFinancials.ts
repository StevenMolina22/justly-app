import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import { formatUnits } from "viem";
import { useStakingToken } from "@/hooks/core/useStakingToken";

interface FinancialData {
  principal: string;     // The amount the user staked
  reward: string;        // The calculated profit
  total: string;         // Principal + Reward
  currency: string;      // USDC
  isWinner: boolean;     // Did the user vote with the majority?
  isLoading: boolean;
}

export function useDisputeFinancials(disputeId: string, enabled = true) {
  const { address } = useAccount();
  const { sliceContract } = useContracts();
  const { decimals, symbol } = useStakingToken();
  const publicClient = usePublicClient();

  const [data, setData] = useState<FinancialData>({
    principal: "0",
    reward: "0",
    total: "0",
    currency: symbol || "USDC",
    isWinner: false,
    isLoading: true,
  });

  useEffect(() => {
    async function calculateRewards() {
      if (!enabled) {
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }
      if (!publicClient || !address || !disputeId || !sliceContract) return;

      try {
        const dId = BigInt(disputeId);

        // 1. Get My Stake
        const myStake = (await publicClient.readContract({
          address: sliceContract,
          abi: SLICE_ABI,
          functionName: "jurorStakes",
          args: [dId, address],
        })) as bigint;

        if (myStake === 0n) {
          setData((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // 2. Get Dispute Info to find number of jurors
        const disputeStruct = (await publicClient.readContract({
          address: sliceContract,
          abi: SLICE_ABI,
          functionName: "disputes",
          args: [dId],
        })) as any;
        
        const required = Number(disputeStruct.jurorsRequired || 3);
        const jurors: string[] = [];
        
        // 3. Fetch all jurors using index-based access
        const jurorCalls = [];
        for (let i = 0; i < required; i++) {
           jurorCalls.push({
             address: sliceContract,
             abi: SLICE_ABI,
             functionName: "disputeJurors",
             args: [dId, BigInt(i)],
           });
        }
        
        const jurorResults = await publicClient.multicall({ contracts: jurorCalls });
        
        jurorResults.forEach((r) => {
            if (r.status === "success" && r.result) {
              jurors.push(r.result as string);
            }
        });

        // 4. Tally Votes & Stakes
        let votesFor0 = 0n;
        let votesFor1 = 0n;
        let myVote = -1;

        // Fetch vote data for all jurors
        const voteCalls = jurors.map(juror => ({
            address: sliceContract,
            abi: SLICE_ABI,
            functionName: "revealedVotes",
            args: [dId, juror],
        }));
        
        const revealedCalls = jurors.map(juror => ({
            address: sliceContract,
            abi: SLICE_ABI,
            functionName: "hasRevealed",
            args: [dId, juror],
        }));
        
        const stakeCalls = jurors.map(juror => ({
            address: sliceContract,
            abi: SLICE_ABI,
            functionName: "jurorStakes",
            args: [dId, juror],
        }));

        const [voteResults, hasRevealedResults, stakeResults] = await Promise.all([
             publicClient.multicall({ contracts: voteCalls }),
             publicClient.multicall({ contracts: revealedCalls }),
             publicClient.multicall({ contracts: stakeCalls }),
        ]);

        for (let i = 0; i < jurors.length; i++) {
            const jurorAddr = jurors[i];
            const revealResult = hasRevealedResults[i];
            const hasRevealed = revealResult.status === "success" ? Boolean(revealResult.result) : false;
            const vote = voteResults[i].status === "success" ? Number(voteResults[i].result) : -1;
            const stake = stakeResults[i].status === "success" ? (stakeResults[i].result as bigint) : 0n;

            if (jurorAddr.toLowerCase() === address.toLowerCase()) {
                if (hasRevealed) myVote = vote;
            }

            if (hasRevealed && vote >= 0) {
                if (vote === 0) votesFor0 += stake;
                else if (vote === 1) votesFor1 += stake;
            }
        }

        // 5. Determine Winner
        // Slice.sol logic: return votesFor1 > votesFor0 ? 1 : 0;
        const winningChoice = votesFor1 > votesFor0 ? 1 : 0;
        const isWinner = (myVote === winningChoice);

        // 6. Calculate Reward
        let calculatedReward = 0n;
        
        if (isWinner) {
            const totalWinningStake = winningChoice === 1 ? votesFor1 : votesFor0;
            const totalLosingStake = winningChoice === 1 ? votesFor0 : votesFor1;
            
            // Slice.sol: Reward = Stake + (Stake * LosingPool / WinningPool)
            // We only want the "Profit" part for the UI display
            if (totalWinningStake > 0n) {
                calculatedReward = (myStake * totalLosingStake) / totalWinningStake;
            }
        }

        const totalReturn = isWinner ? (myStake + calculatedReward) : 0n;

        setData({
            principal: formatUnits(myStake, decimals),
            reward: formatUnits(calculatedReward, decimals),
            total: formatUnits(totalReturn, decimals),
            currency: symbol || "USDC",
            isWinner,
            isLoading: false
        });

      } catch (e) {
        console.error("Failed to calc financials", e);
        setData(prev => ({...prev, isLoading: false}));
      }
    }

    calculateRewards();
  }, [enabled, publicClient, address, disputeId, sliceContract, decimals, symbol]);

  return data;
}
