import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import React from "react";
import ContextProvider from "./providers";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ConsoleOverlay } from "@/components/debug/ConsoleOverlay";
import { getTenantFromHost } from "@/config/tenant";
import { getStrategy } from "@/config/strategies";
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

  // 2. Resolve Strategy
  const { config } = getStrategy(tenant);

  // 3. Hydrate State
  const cookies = headersList.get("cookie");
  const initialState = cookieToInitialState(config, cookies);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex justify-center min-h-screen bg-gray-100`}
      >
        {/* Pass tenant so Client Components know which Strategy to load */}
        <ContextProvider tenant={tenant} initialState={initialState}>
          <div className="w-full max-w-108 min-h-screen bg-white shadow-2xl relative flex flex-col">
            <div className="flex-1 flex flex-col pb-18">{children}</div>

            <BottomNavigation />
            <ConsoleOverlay />
          </div>
        </ContextProvider>
      </body>
    </html>
  );
}
