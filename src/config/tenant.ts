export enum Tenant {
  WEB = "web", // Coinbase Strategy (Main App)
  BEEXO = "beexo", // Beexo Strategy (MiniApp)
  PRIVY = "privy", // Privy Strategy (Frames / Fallback)
}

const BEEXO_SUBDOMAINS = ["beexo.", "mini."];
const PRIVY_SUBDOMAINS = ["frame.", "privy."];

export const getTenantFromHost = (host: string | null): Tenant => {
  if (!host) return Tenant.WEB;

  const hostname = host.split(":")[0];

  if (BEEXO_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
    return Tenant.BEEXO;
  }

  // Example: Use Privy for specific subdomains
  if (PRIVY_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
    return Tenant.PRIVY;
  }

  // Default remains WEB (Coinbase)
  return Tenant.WEB;
};
