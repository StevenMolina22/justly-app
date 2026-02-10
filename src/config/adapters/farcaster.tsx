"use client";

import { ReactNode } from "react";
import {
  cookieStorage,
  createConfig,
  createStorage,
  WagmiProvider,
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";
import { baseAccount } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { activeChains, transports } from "@/config/chains";
import { AuthStrategyProvider } from "@/contexts/AuthStrategyContext";

export const farcasterConfig = createConfig({
  chains: activeChains,
  transports,
  connectors: [
    farcasterMiniApp(),
    baseAccount({
      appName: "Slice",
      appLogoUrl: "/images/slice-logo-light.svg",
    }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
});

export function FarcasterProviderTree({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: any;
}) {
  return (
    <WagmiProvider config={farcasterConfig} initialState={initialState}>
      {children}
    </WagmiProvider>
  );
}

export function FarcasterAuthAdapter({ children }: { children: ReactNode }) {
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();

  return (
    <AuthStrategyProvider
      value={{
        isAuthenticated: isConnected,
        connect: async () => {
          const connector =
            connectors.find(
              (x) =>
                x.type === "farcasterMiniApp" ||
                x.id === "farcasterMiniApp" ||
                x.id.toLowerCase().includes("farcaster"),
            ) ||
            connectors.find((x) => x.type === "baseAccount") ||
            connectors[0];

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
