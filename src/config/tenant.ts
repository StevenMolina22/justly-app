import { sdk } from "@farcaster/miniapp-sdk";

export enum Tenant {
  PRIVY = "privy", // Privy Strategy (Default)
  FARCASTER = "farcaster", // Farcaster Mini App Strategy
  COINBASE = "coinbase", // Coinbase Wallet Strategy
  BEEXO = "beexo", // Beexo Strategy (MiniApp)
}

const PRIVY_SUBDOMAINS = ["frame.", "privy.", "app."];
const FARCASTER_SUBDOMAINS = ["base."];
const COINBASE_SUBDOMAINS = ["coinbase.", "web."];
const BEEXO_SUBDOMAINS = ["beexo.", "mini."];

/**
 * Server-side tenant detection based on host header
 * Used in layout.tsx for initial SSR tenant resolution
 */
export const getTenantFromHost = (host: string | null): Tenant => {
  if (!host) return Tenant.PRIVY;

  const hostname = host.split(":")[0];

  if (BEEXO_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
    return Tenant.BEEXO;
  }

  // Use Farcaster Mini App for specific subdomains
  if (
    FARCASTER_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))
  ) {
    return Tenant.FARCASTER;
  }

  // Use Coinbase Wallet for specific subdomains
  if (COINBASE_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
    return Tenant.COINBASE;
  }

  // Use Privy for specific subdomains
  if (PRIVY_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
    return Tenant.PRIVY;
  }

  // Default is PRIVY
  return Tenant.PRIVY;
};

/**
 * Client-side runtime detection for Farcaster MiniApp
 * This checks if we're actually running inside a Farcaster MiniApp context
 * Should be called on the client after mount
 */
export const detectFarcasterMiniApp = async (): Promise<boolean> => {
  try {
    return await sdk.isInMiniApp();
  } catch (error) {
    // If SDK fails, we're not in a MiniApp
    return false;
  }
};

/**
 * Client-side tenant resolution with runtime detection
 * First checks runtime context (Farcaster SDK), then falls back to host-based detection
 */
export const getClientTenant = async (
  initialTenant: Tenant
): Promise<Tenant> => {
  // If already detected as Farcaster from host, keep it
  if (initialTenant === Tenant.FARCASTER) {
    return Tenant.FARCASTER;
  }

  // Check if we're actually in a Farcaster MiniApp runtime
  const isInMiniApp = await detectFarcasterMiniApp();
  if (isInMiniApp) {
    return Tenant.FARCASTER;
  }

  // Otherwise use the initial server-detected tenant
  return initialTenant;
};
