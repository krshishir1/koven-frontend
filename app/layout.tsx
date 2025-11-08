import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import AuthInitializer from "@/components/AuthInitializer";

export const metadata: Metadata = {
  title: "Minidev - Build viral miniapps on Farcaster",
  description: "Create miniapps with a single prompt—no coding required.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        {/* ✅ Client-side Auth init component */}
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}
