"use client";

import { cookieStorage, createConfig, createStorage } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import { activeChains, transports } from "@/config/chains";
import { WagmiProvider, useConnect, useDisconnect, useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthStrategyProvider } from "./AuthStrategyContext";
import { TimerProvider } from "@/contexts/TimerContext";

// --- 1. Export Config Directly ---
export const config = createConfig({
  chains: activeChains,
  connectors: [coinbaseWallet({ appName: "Slice", preference: "all" })],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: transports,
});

// --- 2. Export Provider Directly ---
export function Provider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: any;
}) {
  const queryClient = new QueryClient();

  // Encapsulated Auth Logic
  function CoinbaseAuth({ children }: { children: React.ReactNode }) {
    const { connectAsync, connectors } = useConnect();
    const { disconnectAsync } = useDisconnect();
    const { isConnected } = useAccount();

    return (
      <AuthStrategyProvider
        value={{
          isAuthenticated: isConnected,
          connect: async () => {
            const c =
              connectors.find((x) => x.id === "coinbaseWalletSDK") ||
              connectors[0];
            await connectAsync({ connector: c });
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
        <CoinbaseAuth>
          <TimerProvider>{children}</TimerProvider>
        </CoinbaseAuth>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
