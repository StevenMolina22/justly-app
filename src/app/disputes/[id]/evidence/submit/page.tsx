"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWriteContract, usePublicClient } from "wagmi";
import { uploadFileToIPFS } from "@/util/ipfs";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { toast } from "sonner";
import { UploadCloud, Loader2, ArrowRight } from "lucide-react";

export default function SubmitEvidencePage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { sliceContract } = useContracts();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!file) return toast.error("Please select a file");

    try {
      setIsUploading(true);
      toast.info("Uploading to IPFS...");

      const ipfsHash = await uploadFileToIPFS(file);
      if (!ipfsHash) throw new Error("IPFS Upload failed");

      toast.info("Submitting to blockchain...");

      const hash = await writeContractAsync({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "submitEvidence",
        args: [BigInt(id), ipfsHash],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success("Evidence submitted successfully!");
      router.back();
    } catch (e: unknown) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : "Failed to submit evidence";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#F8F9FC]">
      <div className="px-4 pt-4">
        <DisputeOverviewHeader
          onBack={() => router.back()}
          title={`Evidence #${id}`}
        />
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center items-center gap-6">
        <div className="w-full max-w-sm bg-white rounded-[32px] p-8 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8 text-[#8c8fff]" />
          </div>

          <h2 className="text-xl font-bold text-[#1b1c23] mb-2">
            Upload Evidence
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            Upload images or documents to support your case. This will be
            visible to all jurors.
          </p>

          <label className="block w-full cursor-pointer">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              accept="image/*,application/pdf"
            />
            <div
              className={`
                w-full py-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-colors
                ${file ? "border-[#8c8fff] bg-[#8c8fff]/5 text-[#8c8fff]" : "border-gray-200 hover:border-gray-300 text-gray-400"}
            `}
            >
              <span className="text-sm font-bold truncate px-4">
                {file ? file.name : "Choose File"}
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={handleSubmit}
          disabled={isUploading || !file}
          className="w-full py-4 bg-[#1b1c23] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Submit On-Chain <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
