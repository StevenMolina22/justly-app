"use client";

import { createConfig } from "wagmi";
import { WagmiProvider as PrivyWagmiProvider } from "@privy-io/wagmi";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { activeChains, transports, defaultChain } from "@/config/chains";
import { injected } from "wagmi/connectors";
import { AuthStrategyProvider } from "@/contexts/AuthStrategyContext";
import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from "@/config/app";
import { ReactNode, useCallback, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { toast } from "sonner";

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
          logo: "/logos/justly-white.svg",
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
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const ensureDefaultChain = useCallback(async () => {
    if (!isConnected || chainId === defaultChain.id) {
      return;
    }

    try {
      await switchChainAsync({ chainId: defaultChain.id });
    } catch (error) {
      console.error("Failed to switch chain", error);
      toast.error(`Wrong network. Switch to ${defaultChain.name}.`);
    }
  }, [chainId, isConnected, switchChainAsync]);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    void ensureDefaultChain();
  }, [authenticated, ensureDefaultChain]);

  return (
    <AuthStrategyProvider
      value={{
        isAuthenticated: authenticated,
        connect: async () => {
          await login();
          await ensureDefaultChain();
        },
        disconnect: async () => logout(),
      }}
    >
      {children}
    </AuthStrategyProvider>
  );
}
