import { Tenant } from "@/config/tenant";
import * as CoinbaseStrategy from "./coinbase";
import * as PrivyStrategy from "./privy";
import * as BeexoStrategy from "./beexo";
import { Config } from "wagmi";
import { JSX, ReactNode } from "react";

export interface StrategyModule {
  config: Config;
  Provider: (props: { children: ReactNode; initialState?: any }) => JSX.Element;
}

const STRATEGIES: Record<Tenant, StrategyModule> = {
  [Tenant.WEB]: CoinbaseStrategy as StrategyModule,
  [Tenant.BEEXO]: BeexoStrategy as StrategyModule,
  [Tenant.PRIVY]: PrivyStrategy as StrategyModule,
};

export function getStrategy(tenant: Tenant): StrategyModule {
  return STRATEGIES[tenant] || STRATEGIES[Tenant.PRIVY];
}
