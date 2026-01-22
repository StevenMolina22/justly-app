"use client";

import { WagmiProvider, useConnect, useDisconnect, useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthStrategyProvider } from "./AuthStrategyContext";
import { TimerProvider } from "@/contexts/TimerContext";
import { beexoConfig } from "@/config/adapters/beexo";

// --- 1. Export Config ---
// We re-export the existing config so the registry can use it for server hydration.
export const config = beexoConfig;

// --- 2. Export Provider ---
export function Provider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: any;
}) {
  const queryClient = new QueryClient();

  // Encapsulated Auth Logic for Beexo (Standard Wagmi)
  function BeexoAuthAdapter({ children }: { children: React.ReactNode }) {
    const { connectAsync, connectors } = useConnect();
    const { disconnectAsync } = useDisconnect();
    const { isConnected } = useAccount();

    return (
      <AuthStrategyProvider
        value={{
          isAuthenticated: isConnected,
          connect: async () => {
            // In Beexo context, we typically grab the first injected connector
            const connector = connectors[0];
            if (connector) {
              await connectAsync({ connector });
            }
          },
          disconnect: async () => disconnectAsync(),
        }}
      >
        {children}
      </AuthStrategyProvider>
    );
  }

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <BeexoAuthAdapter>
          <TimerProvider>{children}</TimerProvider>
        </BeexoAuthAdapter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
