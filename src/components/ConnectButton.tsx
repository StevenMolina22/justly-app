"use client";

import React, { useState } from "react";
import { useSliceConnect } from "@/hooks/core/useSliceConnect";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import {
  Loader2,
  Copy,
  Check,
  Wallet,
  LogOut,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ConnectButton = () => {
  const { connect, disconnect } = useSliceConnect();
  const { address, status } = useAccount();
  const isConnecting = status === "connecting" || status === "reconnecting";

  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setIsOpen(false);
      setShowAddress(false);
      toast.success("Disconnected");
    } catch (e) {
      console.error("Disconnect failed:", e);
    }
  };

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Masked Address Logic
  const maskedAddress = address
    ? `${address.slice(0, 6)}••••••••${address.slice(-4)}`
    : "";

  if (address) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-11 gap-2.5 rounded-2xl border-gray-200 bg-white px-5 text-[#1b1c23] shadow-sm transition-all duration-200 hover:bg-gray-50 hover:text-[#1b1c23] hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Dot removed per request */}

            <span className="font-manrope font-bold tracking-tight text-sm">
              My Profile
            </span>
            <User size={16} className="text-gray-600" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-80 rounded-3xl border-gray-100 p-0 shadow-2xl"
        >
          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <h4 className="font-manrope font-extrabold text-[#1b1c23] flex items-center gap-2 text-base">
                <ShieldCheck className="w-5 h-5 text-[#8c8fff]" />
                My Account
              </h4>
              {/* Swapped Green for Justice Purple (#8c8fff) */}
              <span className="rounded-full bg-[#8c8fff]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#8c8fff] border border-[#8c8fff]/20">
                Active
              </span>
            </div>

            {/* Address Privacy Box */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">
                Wallet Address
              </span>
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:border-gray-200">
                <div className="font-mono text-xs text-gray-600 truncate mr-2 select-all">
                  {showAddress ? address : maskedAddress}
                </div>
                <button
                  onClick={() => setShowAddress(!showAddress)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-[#1b1c23] hover:shadow-sm transition-all"
                  title={showAddress ? "Hide Address" : "Show Address"}
                >
                  {showAddress ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="h-10 text-xs font-bold rounded-xl bg-[#1b1c23] text-white hover:bg-[#2c2d33] shadow-md shadow-gray-200"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-3.5 w-3.5" /> Copy
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="h-10 text-xs font-bold rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                onClick={handleDisconnect}
              >
                <LogOut className="mr-2 h-3.5 w-3.5" /> Disconnect
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="h-11 rounded-2xl bg-[#1b1c23] px-6 text-sm font-bold text-white shadow-xl shadow-gray-200 hover:bg-[#2c2d33] hover:scale-[1.02] active:scale-[0.98] transition-all"
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" /> Login
        </>
      )}
    </Button>
  );
};

export default ConnectButton;
