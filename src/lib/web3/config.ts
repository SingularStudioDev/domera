import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, arbitrumSepolia } from 'wagmi/chains';

export const web3Config = getDefaultConfig({
  appName: 'Domera',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
  chains: [arbitrum, arbitrumSepolia],
  ssr: true,
});

export const ARBITRUM_CHAIN_ID = arbitrum.id;

export const KLEROS_CONTRACTS = {
  // Kleros Arbitrator on Arbitrum One
  arbitrator: process.env.NEXT_PUBLIC_KLEROS_ARBITRATOR_ADDRESS || '0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002',
  // MultipleArbitrableTransaction contract (TODO: Get actual address from Kleros)
  escrow: process.env.NEXT_PUBLIC_KLEROS_ESCROW_ADDRESS || '0x1234567890123456789012345678901234567890', // TODO: Replace with actual address
  // PNK Token on Arbitrum
  pnkToken: '0x330bd769382cfc6d50175903434ccc8d206dcae5',
} as const;

export const DOMERA_RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_DOMERA_RECEIVER_ADDRESS || '0x0000000000000000000000000000000000000000';

export const ESCROW_CONFIG = {
  paymentAmount: '200', // USD 200
  timeoutPayment: 3600, // 1 hour in seconds
  timeoutDispute: 86400, // 24 hours in seconds
  arbitrationFeeDepositPeriod: 300, // 5 minutes in seconds
} as const;