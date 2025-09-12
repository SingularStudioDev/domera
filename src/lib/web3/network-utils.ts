import { arbitrumSepolia } from 'wagmi/chains';
import { ARBITRUM_CHAIN_ID } from './config';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

export const ARBITRUM_SEPOLIA_CONFIG = {
  chainId: `0x${arbitrumSepolia.id.toString(16)}`, // 0x66eee (421614 in hex)
  chainName: arbitrumSepolia.name,
  nativeCurrency: arbitrumSepolia.nativeCurrency,
  rpcUrls: arbitrumSepolia.rpcUrls.default.http,
  blockExplorerUrls: arbitrumSepolia.blockExplorers.default.url ? [arbitrumSepolia.blockExplorers.default.url] : [],
};

export async function switchToArbitrumSepolia(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.warn('No wallet detected');
    return false;
  }

  try {
    // First try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARBITRUM_SEPOLIA_CONFIG.chainId }],
    });
    
    return true;
  } catch (switchError: any) {
    // If the network doesn't exist, add it
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [ARBITRUM_SEPOLIA_CONFIG],
        });
        
        return true;
      } catch (addError) {
        console.error('Failed to add Arbitrum Sepolia network:', addError);
        return false;
      }
    }
    
    console.error('Failed to switch to Arbitrum Sepolia:', switchError);
    return false;
  }
}

export function isArbitrumSepolia(chainId?: number): boolean {
  return chainId === ARBITRUM_CHAIN_ID;
}

export function getNetworkSwitchMessage(currentChainId?: number): string {
  if (!currentChainId) {
    return 'Por favor conecta tu wallet';
  }
  
  if (currentChainId === 1) {
    return 'Cambiar de Ethereum Mainnet a Arbitrum Sepolia';
  }
  
  if (currentChainId === 11155111) {
    return 'Cambiar de Sepolia ETH a Arbitrum Sepolia';
  }
  
  return 'Cambiar a Arbitrum Sepolia';
}