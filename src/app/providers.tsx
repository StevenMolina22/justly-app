"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimerProvider } from "@/contexts/TimerContext";
import { Tenant } from "@/config/tenant";
import * as Privy from "@/config/adapters/privy";
import * as Beexo from "@/config/adapters/beexo";
import * as Coinbase from "@/config/adapters/coinbase";
import * as Farcaster from "@/config/adapters/farcaster";

interface Props {
  children: ReactNode;
  tenant: Tenant;
  initialState?: any;
}

// Create QueryClient singleton outside component to persist cache across renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
      gcTime: 1000 * 60 * 30, // 30 minutes - garbage collection time
    },
  },
});

// Shared providers used across all tenants
function SharedProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TimerProvider>{children}</TimerProvider>
    </QueryClientProvider>
  );
}

export default function ContextProvider({
  children,
  tenant,
  initialState,
}: Props) {
  // Select adapter based on tenant
  let tenantProvider: ReactNode;

  switch (tenant) {
    case Tenant.PRIVY:
      tenantProvider = (
        <Privy.PrivyProviderTree initialState={initialState}>
          <Privy.PrivyAuthAdapter>{children}</Privy.PrivyAuthAdapter>
        </Privy.PrivyProviderTree>
      );
      break;

    case Tenant.BEEXO:
      tenantProvider = (
        <Beexo.BeexoProviderTree initialState={initialState}>
          <Beexo.BeexoAuthAdapter>{children}</Beexo.BeexoAuthAdapter>
        </Beexo.BeexoProviderTree>
      );
      break;

    case Tenant.FARCASTER:
      tenantProvider = (
        <Farcaster.FarcasterProviderTree initialState={initialState}>
          <Farcaster.FarcasterAuthAdapter>{children}</Farcaster.FarcasterAuthAdapter>
        </Farcaster.FarcasterProviderTree>
      );
      break;

    case Tenant.COINBASE:
      tenantProvider = (
        <Coinbase.CoinbaseProviderTree initialState={initialState}>
          <Coinbase.CoinbaseAuthAdapter>
            {children}
          </Coinbase.CoinbaseAuthAdapter>
        </Coinbase.CoinbaseProviderTree>
      );
      break;

    default:
      // Default to PRIVY
      tenantProvider = (
        <Privy.PrivyProviderTree initialState={initialState}>
          <Privy.PrivyAuthAdapter>{children}</Privy.PrivyAuthAdapter>
        </Privy.PrivyProviderTree>
      );
  }

  return <SharedProviders>{tenantProvider}</SharedProviders>;
}
