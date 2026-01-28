import React, { useState } from "react";
import {
  Users,
  Clock,
  Shield,
  CreditCard,
  Gavel,
  Eye,
  Play,
  List,
  CheckCircle,
  Copy,
  AlertCircle,
  XCircle,
  Vote,
  Database,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

interface DisputeInspectorProps {
  data: any; // The enriched rawDisputeData object
  localStorageData: any;
  onJoin: () => void;
  onPay: () => void;
  onVote: (val: number) => void;
  onReveal: () => void;
  onExecute: () => void;
  isPaying: boolean;
  isVoting: boolean;
  logs: string;
}

export const DisputeInspector: React.FC<DisputeInspectorProps> = ({
  data,
  localStorageData,
  onJoin,
  onPay,
  onVote,
  onReveal,
  onExecute,
  isPaying,
  isVoting,
  logs,
}) => {
  const { address } = useAccount();
  const [saltCopied, setSaltCopied] = useState(false);

  const handleCopySalt = () => {
    if (!localStorageData?.salt) return;
    navigator.clipboard.writeText(localStorageData.salt);
    setSaltCopied(true);
    setTimeout(() => setSaltCopied(false), 2000);
    toast.success("Salt copied");
  };

  if (!data)
    return (
      <div className="bg-white rounded-[24px] p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-2 opacity-50">
        <AlertCircle className="w-8 h-8 text-gray-300" />
        <span className="text-sm font-bold text-gray-400">
          No Dispute Selected
        </span>
      </div>
    );

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-md border border-gray-100 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
      {/* --- Header & Status --- */}
      <div className="flex justify-between items-start border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1b1c23] flex items-center gap-2">
            #{data.id}
            <span className="text-xs font-medium text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-lg">
              {data.category}
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                data.statusIndex === 0
                  ? "bg-blue-100 text-blue-700"
                  : data.statusIndex === 1
                    ? "bg-purple-100 text-purple-700"
                    : data.statusIndex === 2
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
              }`}
            >
              {data.status} Phase
            </span>
            {data.userRole !== "None/Juror" && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#1b1c23] text-white">
                You are {data.userRole}
              </span>
            )}
            {data.ipfsHash !== "None" && (
              <a
                href={`https://gateway.pinata.cloud/ipfs/${data.ipfsHash}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-[#8c8fff] transition-colors"
              >
                <List className="w-3 h-3" /> View JSON
              </a>
            )}
          </div>
        </div>
      </div>

      {/* --- Section 1: Parties & Finances --- */}
      <div className="flex flex-col gap-4">
        {/* Parties Card */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3 h-3" /> Payment Status
          </h4>

          {/* Claimer Row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#1b1c23]">
                Claimer
              </span>
              <span className="text-[9px] font-mono text-gray-500">
                {data.claimer.slice(0, 6)}...{data.claimer.slice(-4)}
              </span>
            </div>
            <div
              className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${data.claimerPaid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
            >
              {data.claimerPaid ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              {data.claimerPaid ? "PAID" : "UNPAID"}
            </div>
          </div>

          {/* Defender Row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#1b1c23]">
                Defender
              </span>
              <span className="text-[9px] font-mono text-gray-500">
                {data.defender.slice(0, 6)}...{data.defender.slice(-4)}
              </span>
            </div>
            <div
              className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${data.defenderPaid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
            >
              {data.defenderPaid ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              {data.defenderPaid ? "PAID" : "UNPAID"}
            </div>
          </div>
        </div>

        {/* Voting Stats Card */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Vote className="w-3 h-3" /> Voting Progress
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col bg-white p-2 rounded-lg border border-gray-100 items-center">
              <span className="text-[9px] text-gray-400 font-bold uppercase">
                Required
              </span>
              <span className="text-lg font-black text-[#1b1c23]">
                {data.jurorsRequired}
              </span>
            </div>
            <div className="flex flex-col bg-white p-2 rounded-lg border border-gray-100 items-center">
              <span className="text-[9px] text-gray-400 font-bold uppercase">
                Stake
              </span>
              <span className="text-lg font-black text-[#1b1c23]">
                {data.requiredStake}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs mt-1">
            <div className="flex gap-2">
              <span className="text-gray-500 font-bold">Commits:</span>
              <span className="font-mono">
                {data.commitsCount} / {data.jurorsRequired}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500 font-bold">Reveals:</span>
              <span className="font-mono">
                {data.revealsCount} / {data.commitsCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 1.5: Jury Box (New) --- */}
      <div className="bg-[#1b1c23] p-4 rounded-xl flex flex-col gap-3 text-white">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Gavel className="w-3 h-3 text-[#8c8fff]" /> Selected Jury (
            {data.jurors?.length || 0})
          </h4>
          <span className="text-[9px] font-mono text-gray-500">
            {data.jurors?.length < data.jurorsRequired
              ? "Drafting..."
              : "Jury Full"}
          </span>
        </div>

        {data.jurors && data.jurors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1">
            {data.jurors.map((juror: string, idx: number) => {
              const isMe = juror.toLowerCase() === address?.toLowerCase();
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-mono ${isMe ? "bg-[#2c2d33] border-[#8c8fff] text-white" : "bg-transparent border-gray-700 text-gray-400"}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${isMe ? "bg-[#8c8fff]" : "bg-gray-600"}`}
                  />
                  <span className="flex-1 truncate">{juror}</span>
                  {isMe && (
                    <span className="text-[9px] font-bold bg-[#8c8fff] text-white px-1 rounded">
                      YOU
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 border border-dashed border-gray-700 rounded-lg text-center text-xs text-gray-500 flex flex-col items-center gap-2">
            <UserCheck className="w-4 h-4 opacity-50" />
            No jurors have been selected yet.
          </div>
        )}
      </div>

      {/* --- Section 2: Timelines --- */}
      <div className="bg-[#f5f6f9] p-4 rounded-xl flex flex-col gap-2">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> Protocol Deadlines
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-1">
          <div>
            <span className="block text-[9px] text-gray-400 font-bold uppercase">
              Pay
            </span>
            <span className="font-mono text-xs font-bold text-[#1b1c23]">
              {data.payDeadline.split(",")[0]}
            </span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-400 font-bold uppercase">
              Evidence
            </span>
            <span className="font-mono text-xs font-bold text-[#1b1c23]">
              {data.evidenceDeadline.split(",")[0]}
            </span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-400 font-bold uppercase">
              Commit
            </span>
            <span className="font-mono text-xs font-bold text-[#1b1c23]">
              {data.commitDeadline.split(",")[0]}
            </span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-400 font-bold uppercase">
              Reveal
            </span>
            <span className="font-mono text-xs font-bold text-[#1b1c23]">
              {data.revealDeadline.split(",")[0]}
            </span>
          </div>
        </div>
      </div>

      {/* --- Section 3: Winner Info (If finished) --- */}
      {data.statusIndex === 3 && (
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex justify-between items-center">
          <span className="text-xs font-bold text-emerald-800 uppercase">
            Ruling Executed
          </span>
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-emerald-600 font-bold uppercase">
              Winner
            </span>
            <span className="font-mono text-xs text-emerald-900 font-bold">
              {data.winner}
            </span>
          </div>
        </div>
      )}

      {/* --- Actions --- */}
      <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
        <h3 className="font-bold text-xs text-[#8c8fff] uppercase tracking-wider">
          Dev Controls
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={onJoin}
            className="flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-[0.98] transition-all border border-blue-100 shadow-sm"
          >
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold">Join Jury</span>
          </button>

          <button
            onClick={onPay}
            disabled={isPaying}
            className="flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 active:scale-[0.98] transition-all border border-green-100 shadow-sm disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-[10px] font-bold">Pay Stake</span>
          </button>

          <button
            onClick={() => onVote(1)}
            disabled={isVoting}
            className="flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-[0.98] transition-all border border-gray-200 shadow-sm disabled:opacity-50"
          >
            <Gavel className="w-4 h-4" />
            <span className="text-[10px] font-bold">Vote (1)</span>
          </button>

          <button
            onClick={onReveal}
            disabled={isVoting}
            className="flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 active:scale-[0.98] transition-all border border-purple-100 shadow-sm disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span className="text-[10px] font-bold">Reveal</span>
          </button>
        </div>

        <button
          onClick={onExecute}
          className="w-full py-3.5 bg-[#1b1c23] text-white rounded-xl font-bold text-xs hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md mt-1"
        >
          <Play className="w-3.5 h-3.5 fill-white" /> Force Execute Ruling
        </button>

        {logs && (
          <div className="p-4 bg-gray-900 rounded-xl text-[10px] font-mono text-green-400 whitespace-pre-wrap border border-gray-800 shadow-inner max-h-40 overflow-auto">
            <span className="opacity-50 mr-2">{">"}</span>
            {logs}
          </div>
        )}
      </div>

      {/* --- Local Storage Data --- */}
      {localStorageData && (
        <div className="bg-[#f5f6f9] p-4 rounded-xl border border-dashed border-gray-300 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
              <Database className="w-3 h-3" /> Local Secrets
            </span>
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
              <CheckCircle className="w-3 h-3" />
              <span className="text-[10px] font-bold">Persisted</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-gray-500">Vote Choice:</span>
            <span className="bg-white border border-gray-200 px-2 py-1 rounded-md font-mono font-bold text-[#1b1c23]">
              {localStorageData.vote}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-gray-500 text-xs">
              Secret Salt:
            </span>
            <div className="flex items-start gap-2">
              <div
                className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-[10px] font-mono text-[#1b1c23] break-all leading-relaxed"
                title={localStorageData.salt}
              >
                {localStorageData.salt.length > 20
                  ? `${localStorageData.salt.slice(0, 10)}...${localStorageData.salt.slice(-4)}`
                  : localStorageData.salt}
              </div>
              <button
                onClick={handleCopySalt}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition-all text-gray-500 hover:text-[#1b1c23] shrink-0"
              >
                {saltCopied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
