"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useLayoutStore } from "@/lib/stores/useLayoutStore";
import { DisputesHeader } from "@/components/disputes/DisputesHeader";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";

export const TopNavigation = () => {
  const pathname = usePathname();
  const { title, showBack, rightElement, headerChildren, isHeaderHidden } =
    useLayoutStore();

  if (isHeaderHidden) return null;

  // Strategy: Render Home Header on root, Generic Header elsewhere
  const isHomePage = pathname === "/";

  if (isHomePage) {
    return (
      // Container to ensure z-index stacking context
      <div className="flex-none z-10 bg-background/95 backdrop-blur-sm transition-colors duration-300">
        <DisputesHeader />
      </div>
    );
  }

  return (
    <DisputeOverviewHeader
      title={title}
      showBack={showBack}
      rightElement={rightElement}
    >
      {headerChildren}
    </DisputeOverviewHeader>
  );
};
