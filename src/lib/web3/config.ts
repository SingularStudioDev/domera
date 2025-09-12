import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, arbitrumSepolia, hardhat } from 'wagmi/chains';

// Use testnet for development/testing
const isDevelopment = process.env.NODE_ENV === 'development';
const primaryChain = isDevelopment ? arbitrumSepolia : arbitrum;

export const web3Config = getDefaultConfig({
  appName: 'Domera',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
  chains: [primaryChain, arbitrum, arbitrumSepolia],
  ssr: true,
});

export const ARBITRUM_CHAIN_ID = primaryChain.id;
export const ARBITRUM_SEPOLIA_CHAIN_ID = arbitrumSepolia.id;

export const KLEROS_CONTRACTS = {
  // Kleros Arbitrator on Arbitrum Sepolia (testnet)
  arbitrator: process.env.NEXT_PUBLIC_KLEROS_ARBITRATOR_ADDRESS || '0x1128eD55ab2d796fa92D2F8E1f336d745354a77A', // Kleros Arbitrator on Sepolia
  // PNK Token on Arbitrum Sepolia
  pnkToken: isDevelopment ? '0x34ed0C5A50dBB2C2e0673D257e7bbE0C6Ce2Ae09' : '0x330bd769382cfc6d50175903434ccc8d206dcae5', // Sepolia vs Mainnet
} as const;

export const DOMERA_CONTRACTS = {
  // Our custom DomeraEscrow contract address (deployed on Arbitrum Sepolia)
  escrow: process.env.NEXT_PUBLIC_DOMERA_ESCROW_CONTRACT || '0xFeEc95417D930d2428B9d6102535198ecb644021',
} as const;

export const DOMERA_RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_DOMERA_RECEIVER_ADDRESS || '0x93186173425baba3A8fBcCb58C273beB332Bdb28';

export const ESCROW_CONFIG = {
  // Payment amounts (development uses smaller amounts for testing)
  paymentAmount: isDevelopment ? '0.001' : '0.1', // 0.001 ETH (~$2) for dev, 0.1 ETH (~$200) for prod
  paymentAmountUSD: '200', // USD equivalent
  
  // Timeouts (development uses shorter timeouts for faster testing)
  timeoutPayment: isDevelopment ? 300 : 3600, // 5 minutes for dev, 1 hour for prod
  timeoutDispute: isDevelopment ? 1800 : 86400, // 30 minutes for dev, 24 hours for prod
  arbitrationFeeDepositPeriod: 300, // 5 minutes in seconds
  
  // Demo mode (simulates transactions without real blockchain calls)
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
} as const;

// Test data for development
export const TEST_DATA = {
  // Test transaction IDs that simulate different states
  testTransactionIds: {
    pending: 'test-tx-001',
    completed: 'test-tx-002',
    disputed: 'test-tx-003',
    refunded: 'test-tx-004',
  },
  
  // Test addresses
  testAddresses: {
    domera: '0x742d35Cc7C28f1Cc9c5a26c18d6f2C5e9F5e1234', // Test Domera address
    buyer: '0x8ba1f109551bD432803012645Hac136c1c5e5678', // Test buyer address
  },
  
  // Simulated transaction hashes
  testTxHashes: {
    create: '0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    pay: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
    execute: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  }
} as const;