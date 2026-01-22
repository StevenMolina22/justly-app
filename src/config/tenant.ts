export enum Tenant {
  WEB = "web", // Coinbase Strategy (Main App)
  BEEXO = "beexo", // Beexo Strategy (MiniApp)
  PRIVY = "privy", // Privy Strategy (Frames / Fallback)
}

export const getTenantFromHost = (host: string | null): Tenant => {
  if (!host) return Tenant.WEB;

  const hostname = host.split(":")[0];

  if (hostname.startsWith("beexo.") || hostname.startsWith("mini.")) {
    return Tenant.BEEXO;
  }

  // Example: Use Privy for specific subdomains
  if (hostname.startsWith("frame.")) {
    return Tenant.PRIVY;
  }

  // Default remains WEB (Coinbase)
  return Tenant.WEB;
};
