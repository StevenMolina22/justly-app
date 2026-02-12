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

export const getTenantFromHost = (host: string | null): Tenant => {
  return Tenant.FARCASTER;
};

// export const getTenantFromHost = (host: string | null): Tenant => {
//   if (!host) return Tenant.PRIVY;

//   const hostname = host.split(":")[0];

//   if (BEEXO_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
//     return Tenant.BEEXO;
//   }

//   // Use Farcaster Mini App for specific subdomains
//   if (
//     FARCASTER_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))
//   ) {
//     return Tenant.FARCASTER;
//   }

//   // Use Coinbase Wallet for specific subdomains
//   if (COINBASE_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
//     return Tenant.COINBASE;
//   }

//   // Use Privy for specific subdomains
//   if (PRIVY_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
//     return Tenant.PRIVY;
//   }

//   // Default is PRIVY
//   return Tenant.PRIVY;
// };
