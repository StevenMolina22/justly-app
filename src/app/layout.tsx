import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import React from "react";
import ContextProvider from "./providers";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { AppShell } from "@/components/layout/AppShell";
import { getTenantFromHost, Tenant } from "@/config/tenant";
import { privyConfig } from "@/config/adapters/privy";
import { beexoConfig } from "@/config/adapters/beexo";
import { coinbaseConfig } from "@/config/adapters/coinbase";
import { cookieToInitialState } from "wagmi";

export const metadata: Metadata = {
  title: "Slice",
  description: "Get paid for doing justice",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/slice-logo-light.svg",
    apple: "/icons/icon.png",
  },
  other: {
    "base:app_id": "6966f2640c770beef0486121",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Resolve Tenant
  const headersList = await headers();
  const host = headersList.get("host");
  const tenant = getTenantFromHost(host);

  // 2. Select config based on tenant
  let config;
  switch (tenant) {
    case Tenant.PRIVY:
      config = privyConfig;
      break;
    case Tenant.BEEXO:
      config = beexoConfig;
      break;
    case Tenant.BASE:
      config = coinbaseConfig;
      break;
    default:
      config = privyConfig;
      break;
  }

  // 3. Hydrate State
  const cookies = headersList.get("cookie");
  const initialState = cookieToInitialState(config, cookies);

  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex justify-center min-h-screen bg-background text-foreground`}
      >
        {/* Pass tenant so Client Components know which Strategy to load */}
        <ContextProvider tenant={tenant} initialState={initialState}>
          <AppShell>{children}</AppShell>
        </ContextProvider>
      </body>
    </html>
  );
}
