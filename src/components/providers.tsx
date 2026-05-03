"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { PropsWithChildren, useEffect, useState } from "react";
import { ClusterProvider } from "./cluster-context";
import { WalletProvider } from "../lib/wallet/context";
import { SolanaClientProvider } from "../lib/solana-client-context";
import { AppProvider } from "@/context/app";

export function Providers({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="text-white text-xl">Not yet Frontend mounted</div>;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <ClusterProvider>
        <SolanaClientProvider>
          <WalletProvider>
            <AppProvider>{children}</AppProvider>
          </WalletProvider>
        </SolanaClientProvider>
        <Toaster position="bottom-right" richColors />
      </ClusterProvider>
    </ThemeProvider>
  );
}
