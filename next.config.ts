import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.ENABLE_PWA === "false",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  transpilePackages: ["xo-connect"],

  // Tells Next.js 16: "I know plugins might be injecting webpack config,
  // but I want to use Turbopack anyway."
  turbopack: {},
};

export default withPWA(nextConfig);
