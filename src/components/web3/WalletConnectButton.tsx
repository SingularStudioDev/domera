"use client";

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { ARBITRUM_CHAIN_ID } from '@/lib/web3/config';
import MainButton from '@/components/custom-ui/MainButton';

interface WalletConnectButtonProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function WalletConnectButton({ 
  onConnect, 
  onDisconnect 
}: WalletConnectButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({
    address,
    chainId: ARBITRUM_CHAIN_ID,
  });

  const isOnArbitrum = chain?.id === ARBITRUM_CHAIN_ID;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <MainButton className="w-full">
        Conectar Wallet
      </MainButton>
    );
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div>
            {(() => {
              if (!connected) {
                return (
                  <MainButton 
                    onClick={() => {
                      openConnectModal();
                      onConnect?.();
                    }}
                    className="w-full"
                  >
                    Conectar Wallet
                  </MainButton>
                );
              }

              if (chain.unsupported) {
                return (
                  <MainButton 
                    onClick={openChainModal}
                    className="w-full bg-red-500 hover:bg-red-600"
                  >
                    Red no compatible
                  </MainButton>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {account.displayName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {account.displayBalance}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={openChainModal}
                        className="text-sm text-blue-600 hover:text-blue-800"
                        type="button"
                      >
                        {chain.hasIcon && chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="w-4 h-4 mr-1 inline"
                          />
                        )}
                        {chain.name}
                      </button>
                      <button
                        onClick={() => {
                          openAccountModal();
                          onDisconnect?.();
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                        type="button"
                      >
                        Gestionar
                      </button>
                    </div>
                  </div>

                  {!isOnArbitrum && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Necesitas estar en Arbitrum para usar el escrow
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function WalletInfo() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
    chainId: ARBITRUM_CHAIN_ID,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isConnected) return null;

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-green-800">Wallet Conectada</p>
          <p className="text-xs text-green-600">
            {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
          </p>
        </div>
        {balance && (
          <div className="text-right">
            <p className="text-sm font-medium text-green-800">
              {parseFloat(balance.formatted).toFixed(4)} ETH
            </p>
            <p className="text-xs text-green-600">Balance disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}