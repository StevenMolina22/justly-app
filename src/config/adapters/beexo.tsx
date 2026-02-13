"use client";

import { createConfig, createConnector, CreateConnectorFn } from "wagmi";
import { WagmiProvider, useConnect, useDisconnect, useAccount } from "wagmi";
import { getAddress } from "viem";
import { AuthStrategyProvider } from "@/contexts/AuthStrategyContext";
import {
  activeChains,
  defaultChain,
  rpcUrlsByChainId,
  transports,
} from "@/config/chains";
import { ReactNode } from "react";

// 1. Custom Connector Logic
const DEFAULT_CHAIN_ID_HEX = `0x${defaultChain.id.toString(16)}`;
const beexoRpcs = Object.fromEntries(
  activeChains.map((chain) => [
    `0x${chain.id.toString(16)}`,
    rpcUrlsByChainId[chain.id as keyof typeof rpcUrlsByChainId],
  ]),
);

async function createXOProvider() {
  const { XOConnectProvider } = await import("xo-connect");

  return new XOConnectProvider({
    rpcs: beexoRpcs,
    defaultChainId: DEFAULT_CHAIN_ID_HEX,
  });
}

function beexoConnector(): CreateConnectorFn {
  return createConnector((config) => ({
    id: "beexo",
    name: "Beexo",
    type: "beexo",

    // 1. Connect Logic
    async connect(_parameters) {
      const provider = await createXOProvider();

      // Trigger the XOConnect handshake
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      const chainId = (await provider.request({
        method: "eth_chainId",
      })) as string;

      // Return standard Wagmi data
      return {
        accounts: accounts.map((x) => getAddress(x)),
        chainId: parseInt(chainId, 16),
      } as never;
    },

    // 2. Disconnect Logic
    async disconnect() {
      // XOConnect doesn't have a strict disconnect, but Wagmi needs this method
    },

    // 3. Get Accounts
    async getAccounts() {
      const provider = await createXOProvider();
      const accounts = (await provider.request({
        method: "eth_accounts",
      })) as string[];
      return accounts.map((x) => getAddress(x));
    },

    // 4. Get Chain ID
    async getChainId() {
      const provider = await createXOProvider();
      const chainId = (await provider.request({
        method: "eth_chainId",
      })) as string;
      return parseInt(chainId, 16);
    },

    // 5. Provider Passthrough (Crucial!)
    // This tells Wagmi: "Use THIS provider for all contract calls"
    async getProvider() {
      return createXOProvider();
    },

    // 6. Monitor for changes (Optional but good)
    async isAuthorized() {
      try {
        const accounts = await this.getAccounts();
        return !!accounts.length;
      } catch {
        return false;
      }
    },

    onAccountsChanged(accounts) {
      config.emitter.emit("change", {
        accounts: accounts.map((x) => getAddress(x)),
      });
    },
    onChainChanged(chain) {
      config.emitter.emit("change", { chainId: parseInt(chain, 16) });
    },
    onDisconnect() {
      config.emitter.emit("disconnect");
    },
  }));
}

// 2. Export Config
export const beexoConfig = createConfig({
  chains: activeChains,
  transports,
  connectors: [beexoConnector()],
  ssr: true,
});

// 3. Export Provider Tree
export function BeexoProviderTree({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: any;
}) {
  return (
    <WagmiProvider config={beexoConfig} initialState={initialState}>
      {children}
    </WagmiProvider>
  );
}

// 4. Export Auth Adapter
export function BeexoAuthAdapter({ children }: { children: ReactNode }) {
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
