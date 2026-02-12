"use client";

import { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimerProvider } from "@/contexts/TimerContext";
import { Tenant, getClientTenant } from "@/config/tenant";
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
  tenant: initialTenant,
  initialState,
}: Props) {
  // Client-side tenant resolution with Farcaster runtime detection
  const [tenant, setTenant] = useState<Tenant>(initialTenant);
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function resolveTenant() {
      try {
        const resolvedTenant = await getClientTenant(initialTenant);
        if (mounted && resolvedTenant !== initialTenant) {
          setTenant(resolvedTenant);
        }
      } catch (error) {
        console.error("Failed to resolve tenant:", error);
      } finally {
        if (mounted) {
          setIsResolving(false);
        }
      }
    }

    resolveTenant();

    return () => {
      mounted = false;
    };
  }, [initialTenant]);

  // Show minimal loading state during tenant resolution
  // This prevents hydration mismatches when Farcaster SDK detects MiniApp context
  if (isResolving && initialTenant !== tenant) {
    return (
      <SharedProviders>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse">Loading...</div>
        </div>
      </SharedProviders>
    );
  }

  // Select adapter based on resolved tenant
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
