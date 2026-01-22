"use client";

import { Droplets, Loader2 } from "lucide-react";
import { useFaucet } from "@/hooks/actions/useFaucet";

export const FaucetButton = () => {
  const { mint, isPending, isReady } = useFaucet();

  if (!isReady) return null;

  return (
    <button
      onClick={mint}
      disabled={isPending}
      title="Get Test Tokens"
      className="bg-indigo-100 gap-2 text-indigo-600 border-none rounded-[12.5px] px-3 h-7 flex items-center justify-center cursor-pointer hover:bg-indigo-200 transition-colors disabled:opacity-50"
    >
      <span className="text-foreground text-[12px]">Faucet</span>
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Droplets className="w-3.5 h-3.5" />
      )}
    </button>
  );
};
