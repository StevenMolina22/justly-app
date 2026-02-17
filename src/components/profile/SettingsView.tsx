"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Terminal,
  Bug,
  Shield,
  BookOpen,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useSliceAccount } from "@/hooks/core/useSliceAccount";
import {
  ONBOARDING_REPLAY_EVENT,
  resetOnboarding,
} from "@/hooks/ui/useOnboarding";

export const SettingsView = () => {
  const router = useRouter();
  const { address, isConnected } = useSliceAccount();

  const openConsole = () =>
    window.dispatchEvent(new Event("open-debug-console"));

  const replayOnboarding = () => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet first to replay onboarding");
      return;
    }

    resetOnboarding(address);
    window.dispatchEvent(new Event(ONBOARDING_REPLAY_EVENT));
    toast.success("Onboarding restarted");
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Dev Tools Section */}
      <div className="flex flex-col gap-3">
        <h3 className="font-manrope font-extrabold text-gray-800 uppercase tracking-wide ml-1 text-sm">
          Developer Tools
        </h3>

        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
          <button
            onClick={() => router.push("/debug")}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#8c8fff]/10 flex items-center justify-center text-[#8c8fff] group-hover:scale-110 transition-transform">
              <Bug className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="block text-sm font-bold text-[#1b1c23]">
                Protocol Debugger
              </span>
              <span className="text-[10px] text-gray-400">
                Inspect contract state and raw data
              </span>
            </div>
          </button>

          <button
            onClick={openConsole}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:scale-110 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="block text-sm font-bold text-[#1b1c23]">
                System Console
              </span>
              <span className="text-[10px] text-gray-400">
                View logs and events
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="flex flex-col gap-3">
        <h3 className="font-manrope font-extrabold text-gray-800 uppercase tracking-wide ml-1 text-sm">
          About Justly
        </h3>

        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
          {/* Card Header & Description */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#1b1c23]">
                  Justly Protocol
                </div>
                <div className="text-[11px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                  v0.0.1-beta
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Justly is the <strong>neutral resolution layer</strong> for the
              internet. We leverage random juror selection and crypto-economic
              stakes to ensure fair, trustless, and verifiable rulings for any
              platform.
            </p>
          </div>

          {/* Docs Link */}
          <a
            href="https://docs.justly.one"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group cursor-pointer border-b border-gray-100"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="block text-sm font-bold text-[#1b1c23]">
                Read the Documentation
              </span>
              <span className="text-[10px] text-gray-400">
                Learn how the protocol works
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-[#1b1c23] transition-colors" />
          </a>

          <button
            onClick={replayOnboarding}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="block text-sm font-bold text-[#1b1c23]">
                Replay onboarding
              </span>
              <span className="text-[10px] text-gray-400">
                Show the 3-step onboarding again
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="text-center mt-4">
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          Justly - New standard for justice
        </span>
      </div>
    </div>
  );
};
