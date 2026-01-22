"use client";

import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { WagmiProvider as PrivyWagmiProvider } from "@privy-io/wagmi";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthStrategyProvider } from "./AuthStrategyContext";
import { TimerProvider } from "@/contexts/TimerContext";
import { privyConfig } from "@/config/adapters/privy";
import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from "@/config/app";
import { activeChains, defaultChain } from "@/config/chains";

// --- 1. Export Config ---
export const config = privyConfig;

// --- 2. Export Provider ---
export function Provider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: any;
}) {
  const queryClient = new QueryClient();

  // Encapsulated Auth Logic for Privy
  function PrivyAuthAdapter({ children }: { children: React.ReactNode }) {
    const { login, logout, authenticated } = usePrivy();

    return (
      <AuthStrategyProvider
        value={{
          isAuthenticated: authenticated,
          connect: async () => login(),
          disconnect: async () => logout(),
        }}
      >
        {children}
      </AuthStrategyProvider>
    );
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
      config={{
        defaultChain: defaultChain,
        supportedChains: [...activeChains],
        appearance: {
          theme: "light",
          accentColor: "#1b1c23",
          logo: "/images/slice-logo-light.svg",
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        loginMethods: ["email", "wallet"],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <PrivyWagmiProvider config={config} initialState={initialState}>
          <SmartWalletsProvider>
            <PrivyAuthAdapter>
              <TimerProvider>{children}</TimerProvider>
            </PrivyAuthAdapter>
          </SmartWalletsProvider>
        </PrivyWagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
