const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object for Justly Protocol.
 * Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjE1NTkwMDQsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg2RTdiNWZBNjFBOTFDN2E5NDY5NkVkQ0I2QTQwQWRGMWY5RTYxMzk3In0",
    payload: "eyJkb21haW4iOiJhcHAuanVzdGx5Lm9uZSJ9",
    signature:
      "VaFpDdWVDRRhaTpPV72VGnBn+qsEcpD8QWDuWLa2oUUaGmvJpnWERVFPCkF8u8NVi/opvS3pq4hQTcihCCNMtxw=",
  },
  baseBuilder: {
    ownerAddress: "",
  },
  miniapp: {
    version: "1",
    name: "Justly",
    subtitle: "Real-Time Dispute Resolution",
    description:
      "Stake tokens, review evidence, and get paid for doing justice as a decentralized juror.",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/logos/justly-white.svg`, // Matches your layout.tsx & Farcaster config
    splashImageUrl: `${ROOT_URL}/logos/justly-white.svg`,
    splashBackgroundColor: "#F8F9FC",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "finance",
    tags: ["escrow", "disputes", "earn", "web3"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Get paid for doing justice",
    ogTitle: "Justly Protocol",
    ogDescription: "The decentralized, real-time dispute resolution protocol.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
