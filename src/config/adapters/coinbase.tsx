"use client";

import { cookieStorage, createConfig, createStorage } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import { activeChains, transports } from "@/config/chains";
import { WagmiProvider, useConnect, useDisconnect, useAccount } from "wagmi";
import { AuthStrategyProvider } from "@/contexts/AuthStrategyContext";
import { ReactNode } from "react";

// --- Export Config ---
export const coinbaseConfig = createConfig({
  chains: activeChains,
  connectors: [coinbaseWallet({ appName: "Slice", preference: "all" })],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: transports,
});

// --- Export Provider Tree ---
export function CoinbaseProviderTree({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: any;
}) {
  return (
    <WagmiProvider config={coinbaseConfig} initialState={initialState}>
      {children}
    </WagmiProvider>
  );
}

// --- Export Auth Adapter ---
export function CoinbaseAuthAdapter({ children }: { children: ReactNode }) {
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();

  return (
    <AuthStrategyProvider
      value={{
        isAuthenticated: isConnected,
        connect: async () => {
          const connector =
            connectors.find((x) => x.id === "coinbaseWalletSDK") ||
            connectors[0];
          await connectAsync({ connector });
        },
        disconnect: async () => disconnectAsync(),
      }}
    >
      {children}
    </AuthStrategyProvider>
  );
}
