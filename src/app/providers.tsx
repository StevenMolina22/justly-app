"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimerProvider } from "@/contexts/TimerContext";
import { Tenant } from "@/config/tenant";
import * as Privy from "@/config/adapters/privy";
import * as Beexo from "@/config/adapters/beexo";
import * as Coinbase from "@/config/adapters/coinbase";

interface Props {
  children: ReactNode;
  tenant: Tenant;
  initialState?: any;
}

// Shared providers used across all tenants
function SharedProviders({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

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

    case Tenant.WEB:
    default:
      tenantProvider = (
        <Coinbase.CoinbaseProviderTree initialState={initialState}>
          <Coinbase.CoinbaseAuthAdapter>
            {children}
          </Coinbase.CoinbaseAuthAdapter>
        </Coinbase.CoinbaseProviderTree>
      );
  }

  return <SharedProviders>{tenantProvider}</SharedProviders>;
}
