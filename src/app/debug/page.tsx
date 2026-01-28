"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Terminal, Search } from "lucide-react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useSliceVoting } from "@/hooks/voting/useSliceVoting";
import { usePayDispute } from "@/hooks/actions/usePayDispute";
import { getVoteData } from "@/util/votingStorage";
import { useExecuteRuling } from "@/hooks/actions/useExecuteRuling";
import { usePublicClient, useAccount, useWriteContract } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import { GlobalStateCard } from "@/components/debug/GlobalStateCard";
import { DisputeInspector } from "@/components/debug/DisputeInspector";
import { DebugToggle } from "@/components/debug/DebugToggle";

export default function DebugPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { sliceContract } = useContracts();

  const publicClient = usePublicClient();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const {
    commitVote,
    revealVote,
    isProcessing: isVoting,
    logs,
  } = useSliceVoting();
  const { payDispute, isPaying } = usePayDispute();
  const { executeRuling } = useExecuteRuling();

  // State
  const [targetId, setTargetId] = useState("1");
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [rawDisputeData, setRawDisputeData] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [myPartyDisputes, setMyPartyDisputes] = useState<string[]>([]);
  const [myJurorDisputes, setMyJurorDisputes] = useState<string[]>([]);

  // --- 1. Global & Context Fetching ---
  const refreshGlobalState = useCallback(async () => {
    if (!publicClient || !address || !sliceContract) return;
    try {
      const count = (await publicClient.readContract({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "disputeCount",
      })) as bigint;

      const userDisputeIds = (await publicClient.readContract({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "getUserDisputes",
        args: [address as `0x${string}`],
      })) as bigint[];

      const jurorDisputeIds = (await publicClient.readContract({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "getJurorDisputes",
        args: [address as `0x${string}`],
      })) as bigint[];

      setMyPartyDisputes(userDisputeIds.map((id) => id.toString()));
      setMyJurorDisputes(jurorDisputeIds.map((id) => id.toString()));
      setContractInfo({ count: count.toString() });
    } catch (e) {
      console.error(e);
      // Fail silently for smoother UX on partial loads
    }
  }, [publicClient, address, sliceContract]);

  useEffect(() => {
    refreshGlobalState();
  }, [refreshGlobalState]);

  // --- 2. Dispute Inspector Fetcher ---
  const fetchRawDispute = async () => {
    if (!publicClient || !targetId || !sliceContract) return;
    setIsLoadingData(true);
    try {
      // 1. Fetch main struct
      const d = (await publicClient.readContract({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "disputes",
        args: [BigInt(targetId)],
      })) as any;

      const statusLabels = ["Created", "Commit", "Reveal", "Executed"];
      const isClaimer = d.claimer.toLowerCase() === address?.toLowerCase();
      const isDefender = d.defender.toLowerCase() === address?.toLowerCase();

      // 2. Fetch specific mappings (Reveal status)
      let hasRevealed = false;
      try {
        if (address) {
          hasRevealed = (await publicClient.readContract({
            address: sliceContract,
            abi: SLICE_ABI,
            functionName: "hasRevealed",
            args: [BigInt(targetId), address as `0x${string}`],
          })) as boolean;
        }
      } catch (e) {
        console.error("hasRevealed check failed", e);
      }

      // 3. Fetch Jurors List
      let jurors: string[] = [];
      try {
        // Attempt to fetch jurors using the standard helper
        const jurorsData = (await publicClient.readContract({
          address: sliceContract,
          abi: SLICE_ABI,
          functionName: "getJurors", // Standard Slice getter
          args: [BigInt(targetId)],
        })) as string[];
        jurors = jurorsData;
      } catch (e) {
        console.warn(
          "Could not fetch jurors list (getJurors might be missing from ABI)",
          e,
        );
      }

      // 4. Format complete data object
      setRawDisputeData({
        id: targetId,
        statusIndex: Number(d.status),
        status: statusLabels[Number(d.status)] || "Unknown",
        // Parties
        claimer: d.claimer,
        defender: d.defender,
        winner:
          d.winner === "0x0000000000000000000000000000000000000000"
            ? "Pending/None"
            : d.winner,
        // Config
        category: d.category,
        jurorsRequired: d.jurorsRequired.toString(),
        requiredStake: formatUnits(d.requiredStake, 6) + " USDC",
        ipfsHash: d.ipfsHash || "None",
        // Progress (Voting)
        commitsCount: Number(d.commitsCount),
        revealsCount: Number(d.revealsCount),
        // Payment Status
        claimerPaid: d.claimerPaid,
        defenderPaid: d.defenderPaid,
        // Timelines
        payDeadline: new Date(Number(d.payDeadline) * 1000).toLocaleString(),
        evidenceDeadline: new Date(
          Number(d.evidenceDeadline) * 1000,
        ).toLocaleString(),
        commitDeadline: new Date(
          Number(d.commitDeadline) * 1000,
        ).toLocaleString(),
        revealDeadline: new Date(
          Number(d.revealDeadline) * 1000,
        ).toLocaleString(),
        // Context
        userRole: isClaimer
          ? "Claimer"
          : isDefender
            ? "Defender"
            : "None/Juror",
        hasRevealedOnChain: hasRevealed,
        jurors: jurors || [], // Pass jurors to UI
      });

      if (address && sliceContract) {
        const stored = getVoteData(sliceContract, targetId, address);
        setLocalStorageData(stored);
      }
    } catch (e) {
      console.error(e);
      toast.error(`Dispute #${targetId} not found`);
      setRawDisputeData(null);
    } finally {
      setIsLoadingData(false);
    }
  };

  // --- 3. Action Handlers ---
  const handleQuickCreate = async () => {
    if (!address) return toast.error("Connect wallet");
    if (!sliceContract) return toast.error("Contract address missing");

    try {
      toast.info("Sending custom createDispute tx...");

      const hash = await writeContractAsync({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "createDispute",
        account: address,
        args: [
          {
            claimer: "0x3AE66a6DB20fCC27F3DB3DE5Fe74C108A52d6F29", // Bob
            defender: "0x58609c13942F56e17d36bcB926C413EBbD10e477", // Alice
            category: "General",
            ipfsHash:
              "bafkreiamcbxmdxau7daffssq4zcpaplfg3wtfwftsmwrvl6rhcesugirvi",
            jurorsRequired: BigInt(1),
            paySeconds: BigInt(86400),
            evidenceSeconds: BigInt(86400),
            commitSeconds: BigInt(86400),
            revealSeconds: BigInt(86400),
          },
        ],
      });

      toast.success("Transaction sent!");

      if (publicClient) {
        toast.info("Waiting for confirmation...");
        await publicClient.waitForTransactionReceipt({ hash });
        toast.success("Dispute created successfully!");
        refreshGlobalState();
      }
    } catch (e: any) {
      console.error(e);
      toast.error(`Create failed: ${e.shortMessage || e.message}`);
    }
  };

  const handleJoin = async () => {
    toast.info(
      "Please use the main UI to join (Code migrated to useAssignDispute)",
    );
  };

  const handleExecute = async () => {
    await executeRuling(targetId);
    setTimeout(() => {
      fetchRawDispute();
      refreshGlobalState();
    }, 2000);
  };

  const handleSelectId = (id: string) => {
    setTargetId(id);
    setTimeout(() => {
      const btn = document.getElementById("btn-fetch");
      if (btn) btn.click();
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-manrope pb-20">
      {/* Header */}
      <div className="pt-8 px-6 pb-4 bg-white shadow-sm sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-[#1b1c23]" />
          </button>
          <h1 className="text-xl font-extrabold text-[#1b1c23] flex items-center gap-2">
            <Terminal className="w-6 h-6 text-[#8c8fff]" /> Debug Console
          </h1>
        </div>
        <button
          onClick={refreshGlobalState}
          className="w-10 h-10 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors text-[#1b1c23] flex items-center justify-center"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-5 flex flex-col gap-6 overflow-y-auto">
        <GlobalStateCard
          contractInfo={contractInfo}
          isCreating={isWriting}
          onCreate={handleQuickCreate}
          myPartyDisputes={myPartyDisputes}
          myJurorDisputes={myJurorDisputes}
          targetId={targetId}
          onSelectId={handleSelectId}
        />

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-[18px] border border-gray-100 shadow-sm flex items-center gap-2 sticky top-[80px] z-10">
          <div className="pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="number"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="Enter Dispute ID..."
            className="flex-1 p-2 outline-none text-[#1b1c23] font-bold bg-transparent font-mono"
          />
          <button
            id="btn-fetch"
            onClick={fetchRawDispute}
            disabled={isLoadingData}
            className="bg-[#f5f6f9] text-[#1b1c23] px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors min-w-[80px]"
          >
            {isLoadingData ? "..." : "Fetch"}
          </button>
        </div>

        <DisputeInspector
          data={rawDisputeData}
          localStorageData={localStorageData}
          onJoin={handleJoin}
          onPay={() =>
            payDispute(targetId, "1.0").then(() => fetchRawDispute())
          }
          onVote={(val) => commitVote(targetId, val)}
          onReveal={() => revealVote(targetId)}
          onExecute={handleExecute}
          isPaying={isPaying}
          isVoting={isVoting}
          logs={logs}
        />
      </div>

      {/* Bottom Right toggle*/}
      <DebugToggle />
    </div>
  );
}
