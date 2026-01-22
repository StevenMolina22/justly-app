"use client";

import { createConfig } from "wagmi";
import { WagmiProvider as PrivyWagmiProvider } from "@privy-io/wagmi";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { activeChains, transports, defaultChain } from "@/config/chains";
import { injected } from "wagmi/connectors";
import { AuthStrategyProvider } from "@/contexts/AuthStrategyContext";
import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from "@/config/app";
import { ReactNode } from "react";

export const privyConfig = createConfig({
  chains: activeChains,
  transports,
  connectors: [injected()],
  ssr: true,
});

// Export Provider Tree
export function PrivyProviderTree({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: any;
}) {
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
      <PrivyWagmiProvider config={privyConfig} initialState={initialState}>
        <SmartWalletsProvider>{children}</SmartWalletsProvider>
      </PrivyWagmiProvider>
    </PrivyProvider>
  );
}

// Export Auth Adapter
export function PrivyAuthAdapter({ children }: { children: ReactNode }) {
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

