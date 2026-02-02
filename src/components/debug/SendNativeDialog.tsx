"use client";

import React, { useState } from "react";
import { Loader2, X, Scan, ArrowLeft } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useSendNative } from "@/hooks/actions/useSendNative";
import { useNativeBalance } from "@/hooks/core/useNativeBalance";
import { toast } from "sonner";

interface SendNativeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendNativeDialog: React.FC<SendNativeDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { symbol, formatted } = useNativeBalance();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Use the hook, passing a callback to clear the form on success
  const { sendNative, isLoading } = useSendNative(() => {
    onClose();
    setRecipient("");
    setAmount("");
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendNative(recipient, amount);
  };

  const handleScan = (result: string) => {
    if (result) {
      // 1. Clean the result. Wallet QRs often come as "ethereum:0x...?value=..."
      // We regex to find the 0x address pattern
      const addressMatch = result.match(/0x[a-fA-F0-9]{40}/);

      if (addressMatch) {
        setRecipient(addressMatch[0]);
        setIsScanning(false);
        toast.success("Address scanned!");
      } else {
        toast.error("Invalid QR code format");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* VIEW 1: QR SCANNER */}
        {isScanning ? (
          <div className="flex flex-col h-full min-h-[350px]">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setIsScanning(false)}
                className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-[#1b1c23] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <h3 className="text-sm font-extrabold text-[#1b1c23]">Scan QR</h3>
              <div className="w-8" /> {/* Spacer for balance */}
            </div>

            <div className="flex-1 bg-black rounded-2xl overflow-hidden relative border border-gray-100 shadow-inner">
              <Scanner
                onScan={(detectedCodes) =>
                  detectedCodes.length > 0 && handleScan(detectedCodes[0].rawValue)
                }
                components={{
                  torch: false,
                }}
                styles={{
                  container: { height: "100%", width: "100%" },
                }}
              />
              {/* Overlay Guide */}
              <div className="absolute inset-0 border-[30px] border-black/50 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-[#8c8fff] bg-transparent rounded-lg opacity-80" />
              </div>
            </div>
            <p className="text-center text-[11px] font-bold text-gray-400 mt-4">
              Point camera at an Ethereum address QR code
            </p>
          </div>
        ) : (
          /* VIEW 2: SEND FORM */
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h2 className="text-xl font-extrabold text-[#1b1c23] font-manrope">
                  Send {symbol}
                </h2>
                <span className="text-xs font-bold text-gray-400">
                  Balance: {formatted} {symbol}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Recipient Address
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-4 pr-12 bg-[#f5f6f9] rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#8c8fff] transition-all truncate"
                    disabled={isLoading}
                  />
                  {/* Scan Button inside Input */}
                  <button
                    type="button"
                    onClick={() => setIsScanning(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#8c8fff] hover:bg-white rounded-lg transition-all shadow-sm"
                    title="Scan QR Code"
                  >
                    <Scan className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Amount ({symbol})
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 bg-[#f5f6f9] rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-[#8c8fff] transition-all"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-[#1b1c23] text-white rounded-xl font-bold hover:bg-[#2c2d33] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Send"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
