import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retium SuperHub | Post-Quantum DeFi",
  description: "All-in-One Post-Quantum DeFi Hub on Retium Chain: RTM/RTD Pay, Whisk DEX, Safe Vault & VIP Pass.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">{children}</body>
    </html>
  );
}
