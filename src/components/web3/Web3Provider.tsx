"use client";

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { web3Config } from '@/lib/web3/config';
import { useState, useEffect } from 'react';

import '@rainbow-me/rainbowkit/styles.css';

interface Web3ProviderProps {
  children: React.ReactNode;
}

// Create query client with SSR-safe configuration
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export function Web3Provider({ children }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(() => createQueryClient());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a fallback or loading state during SSR
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={web3Config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#ff6b35', // Using Domera's primary color
            accentColorForeground: 'white',
          })}
          showRecentTransactions={true}
          appInfo={{
            appName: 'Domera',
            learnMoreUrl: 'https://domera.com',
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}