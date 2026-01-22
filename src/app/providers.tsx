"use client";

import { ReactNode } from "react";
import { Tenant } from "@/config/tenant";
import { getStrategy } from "@/config/strategies";

interface Props {
  children: ReactNode;
  tenant: Tenant;
  initialState?: any;
}

export default function ContextProvider({
  children,
  tenant,
  initialState,
}: Props) {
  // 1. Dynamically select the correct Provider component
  // We rename 'Provider' to 'StrategyProvider' to make it valid JSX
  const { Provider: StrategyProvider } = getStrategy(tenant);

  // 2. Render it with the hydrated state
  return (
    <StrategyProvider initialState={initialState}>{children}</StrategyProvider>
  );
}
