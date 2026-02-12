"use client";

import React, { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { ConsoleOverlay } from "@/components/debug/ConsoleOverlay";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  // Signal to Farcaster MiniApp that the app is ready
  useEffect(() => {
    sdk.actions.ready().catch((error) => {
      // Silently fail if not in MiniApp context
      console.debug("Farcaster SDK ready signal failed (not in MiniApp):", error);
    });
  }, []);

  return (
    <div className="w-full max-w-md h-[100dvh] bg-background shadow-2xl relative flex flex-col overflow-hidden mx-auto border-x border-gray-200/50">
      <TopNavigation />

      {/* Main Content Area
          - Removed 'pb-24': BottomNav is now in the flow, no padding needed to prevent overlap
          - Added '[&>*]:flex-1 [&>*]:flex [&>*]:flex-col [&>*]:w-full': 
            Forces the direct child (Next.js Page) to always be a full-width/height flex column
      */}
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-smooth bg-background [&>*]:flex-1 [&>*]:flex [&>*]:flex-col [&>*]:w-full">
        {children}
      </main>

      <div className="flex-none z-50">
        <ConsoleOverlay />
        <BottomNavigation />
      </div>

      <OnboardingModal />
    </div>
  );
};
