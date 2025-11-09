"use client";

import type React from "react";
import AppShell from "@/components/dashboard/AppShell";

import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, mainnet } from "wagmi/chains";

import "@rainbow-me/rainbowkit/styles.css";

console.log("Wallet connection", process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID)

export const config = getDefaultConfig({
  appName: "Koven",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [sepolia, mainnet],
  ssr: true,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          <AppShell>{children}</AppShell>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
