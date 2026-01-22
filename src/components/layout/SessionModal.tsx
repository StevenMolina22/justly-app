"use client";

import { useSliceAccount } from "@/hooks/core/useSliceAccount";
import { useSliceConnect } from "@/hooks/core/useSliceConnect";
import { Copy, LogOut, X } from "lucide-react";
import { toast } from "sonner";

export const SessionModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { address } = useSliceAccount();
  const { disconnect } = useSliceConnect();

  if (!isOpen || !address) return null;

  // Get the display address (embedded wallet or connected external wallet)
  const displayAddress = address || "";
  const shortAddress = displayAddress
    ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
    : "No Wallet";

  const handleCopy = () => {
    navigator.clipboard.writeText(displayAddress);
    toast.success("Address copied!");
  };

  const handleLogout = async () => {
    await disconnect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mb-3">
            👻
          </div>
          <h2 className="text-lg font-extrabold text-[#1b1c23]">
            Session Info
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            Connected Wallet
          </span>
        </div>

        {/* Address Card */}
        <div className="bg-[#f5f6f9] p-4 rounded-xl flex items-center justify-between mb-6 border border-gray-100">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400">
              Wallet Address
            </span>
            <span className="font-mono text-sm font-bold text-[#1b1c23]">
              {shortAddress}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-all active:scale-95"
          >
            <Copy className="w-4 h-4 text-[#8c8fff]" />
          </button>
        </div>

        {/* User Address Info */}
        <div className="mb-6 px-2">
          <p className="text-xs text-gray-400 truncate">
            <span className="font-bold">Full Address:</span> {displayAddress}
          </p>
        </div>

        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    </div>
  );
};
