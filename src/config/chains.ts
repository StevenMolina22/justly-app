import { http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

// 1. Determine Strategy
const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";

// 2. Active Configuration (Contracts & Logic)
export const appConfig = {
  chain: isProd ? base : baseSepolia,
  contracts: {
    slice: isProd
      ? process.env.NEXT_PUBLIC_BASE_SLICE_CONTRACT!
      : process.env.NEXT_PUBLIC_BASE_SEPOLIA_SLICE_CONTRACT!,
  },
} as const;

// 3. Wagmi Chains
export const activeChains = isProd
  ? ([base, baseSepolia] as const)
  : ([baseSepolia, base] as const);

export const defaultChain = appConfig.chain;

// 4. Transport Strategy (NEW)
// Define connection methods explicitly here. This guarantees type safety
// because we are using the chain IDs directly as keys.
export const transports = {
  [base.id]: http(),
  [baseSepolia.id]: http(),
} as const;
