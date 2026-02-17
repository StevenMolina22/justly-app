"use client";

import React, { useState } from "react";
import QRCode from "react-qr-code";
import { X, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { shortenAddress } from "@/util/wallet";

interface MyQRModalProps {
  address: string | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function MyQRModal({ address, isOpen, onClose }: MyQRModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !address) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-sm rounded-[32px] p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="text-center mb-6 mt-2">
          <h3 className="text-xl font-extrabold text-[#1b1c23]">My Justly Code</h3>
          <p className="text-gray-400 font-medium mt-1 text-sm">
            Scan to add <span className="text-[#1b1c23] font-mono font-bold">{shortenAddress(address)}</span>
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-3xl border-2 border-dashed border-gray-200 bg-white">
            <QRCode 
              value={address} 
              size={200}
              viewBox={`0 0 256 256`}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>
        </div>

        <button 
          onClick={handleCopy}
          className="w-full py-4 bg-[#F8F9FC] border border-gray-100 rounded-2xl flex items-center justify-center gap-2 font-bold text-[#1b1c23] hover:bg-gray-100 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy Address"}
        </button>
      </div>
    </div>
  );
}
