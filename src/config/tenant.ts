export enum Tenant {
  PRIVY = "privy", // Privy Strategy (Default)
  BASE = "base", // Base Strategy (Coinbase)
  BEEXO = "beexo", // Beexo Strategy (MiniApp)
}

const PRIVY_SUBDOMAINS = ["frame.", "privy.", "app."];
const BASE_SUBDOMAINS = ["base.", "web."];
const BEEXO_SUBDOMAINS = ["beexo.", "mini."];

export const getTenantFromHost = (host: string | null): Tenant => {
  if (!host) return Tenant.PRIVY;

  const hostname = host.split(":")[0];

  if (BEEXO_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
    return Tenant.BEEXO;
  }

  // Use Base for specific subdomains
  if (BASE_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
    return Tenant.BASE;
  }

  // Use Privy for specific subdomains
  if (PRIVY_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
    return Tenant.PRIVY;
  }

  // Default is PRIVY
  return Tenant.PRIVY;
};
