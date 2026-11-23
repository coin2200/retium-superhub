import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retium SuperHub | Post-Quantum DeFi",
  description: "All-in-one Post-Quantum DeFi hub on Retium Testnet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://wallet.retium.org/connect/sdk/retium-sdk-1.3.0.js"
          integrity="sha384-FTG6s31+cSLKvZXfREum814s/L2AnqVyikuFQvMKIvFfAz40ksTcaXVbRmkHGGTU"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-[#050508] text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
