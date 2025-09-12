"use client";

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { KLEROS_CONTRACTS, DOMERA_CONTRACTS, ARBITRUM_CHAIN_ID } from '../config';
import { DOMERA_ESCROW_ABI, EscrowData } from '../contracts/domera-escrow';

export interface CreateEscrowParams {
  receiverAddress: string;
  amount: string; // in ETH
  timeoutHours?: number;
  propertyId: string;
  propertyTitle: string;
  metaEvidence: {
    title: string;
    description: string;
    question: string;
    rulingOptions: {
      type: string;
      titles: string[];
      descriptions: string[];
    };
  };
}

export interface EscrowOperationResult {
  transactionId?: string;
  transactionHash?: string;
  error?: string;
  isLoading: boolean;
  isSuccess: boolean;
}

export function useEscrow() {
  const { address, isConnected, chain } = useAccount();
  const { writeContract, data: writeData, isPending: isWriting } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  const [currentTxId, setCurrentTxId] = useState<string | null>(null);

  const isOnArbitrum = chain?.id === ARBITRUM_CHAIN_ID;
  const isReady = isConnected && isOnArbitrum;

  // Create a new escrow transaction
  const createEscrow = async (params: CreateEscrowParams): Promise<EscrowOperationResult> => {
    if (!isReady) {
      return {
        error: 'Wallet not connected or not on Arbitrum network',
        isLoading: false,
        isSuccess: false,
      };
    }

    if (!DOMERA_CONTRACTS.escrow) {
      return {
        error: 'DomeraEscrow contract not deployed yet',
        isLoading: false,
        isSuccess: false,
      };
    }

    try {
      const metaEvidenceJson = JSON.stringify(params.metaEvidence);
      const timeoutTimestamp = Math.floor(Date.now() / 1000) + ((params.timeoutHours || 24) * 3600); // Current time + hours in seconds
      
      await writeContract({
        address: DOMERA_CONTRACTS.escrow as `0x${string}`,
        abi: DOMERA_ESCROW_ABI,
        functionName: 'createEscrow',
        args: [
          params.receiverAddress as `0x${string}`,
          BigInt(timeoutTimestamp),
          metaEvidenceJson,
          params.propertyId,
          params.propertyTitle,
        ],
        value: parseEther(params.amount),
      });

      return {
        transactionHash: writeData,
        isLoading: false,
        isSuccess: true,
      };
    } catch (error) {
      console.error('Error creating escrow:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
        isSuccess: false,
      };
    }
  };

  // Release funds (receiver claims payment)
  const releaseFunds = async (escrowId: string): Promise<EscrowOperationResult> => {
    if (!isReady || !DOMERA_CONTRACTS.escrow) {
      return {
        error: 'Wallet not connected or contract not available',
        isLoading: false,
        isSuccess: false,
      };
    }

    try {
      writeContract({
        address: DOMERA_CONTRACTS.escrow as `0x${string}`,
        abi: DOMERA_ESCROW_ABI,
        functionName: 'releaseFunds',
        args: [BigInt(escrowId)],
      });

      return {
        transactionId: escrowId,
        transactionHash: writeData,
        isLoading: isWriting || isTxLoading,
        isSuccess: isTxSuccess,
      };
    } catch (error) {
      console.error('Error releasing funds:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
        isSuccess: false,
      };
    }
  };

  // Reclaim funds (buyer gets refund after timeout)
  const reclaimFunds = async (escrowId: string): Promise<EscrowOperationResult> => {
    if (!isReady || !DOMERA_CONTRACTS.escrow) {
      return {
        error: 'Wallet not connected or contract not available',
        isLoading: false,
        isSuccess: false,
      };
    }

    try {
      writeContract({
        address: DOMERA_CONTRACTS.escrow as `0x${string}`,
        abi: DOMERA_ESCROW_ABI,
        functionName: 'reclaimFunds',
        args: [BigInt(escrowId)],
      });

      return {
        transactionId: escrowId,
        transactionHash: writeData,
        isLoading: isWriting || isTxLoading,
        isSuccess: isTxSuccess,
      };
    } catch (error) {
      console.error('Error reclaiming funds:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
        isSuccess: false,
      };
    }
  };

  // Create dispute
  const createDispute = async (escrowId: string, arbitrationFee: string): Promise<EscrowOperationResult> => {
    if (!isReady || !DOMERA_CONTRACTS.escrow) {
      return {
        error: 'Wallet not connected or contract not available',
        isLoading: false,
        isSuccess: false,
      };
    }

    try {
      writeContract({
        address: DOMERA_CONTRACTS.escrow as `0x${string}`,
        abi: DOMERA_ESCROW_ABI,
        functionName: 'createDispute',
        args: [BigInt(escrowId)],
        value: parseEther(arbitrationFee),
      });

      return {
        transactionId: escrowId,
        transactionHash: writeData,
        isLoading: isWriting || isTxLoading,
        isSuccess: isTxSuccess,
      };
    } catch (error) {
      console.error('Error creating dispute:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
        isSuccess: false,
      };
    }
  };

  return {
    // State
    isReady,
    isConnected,
    isOnArbitrum,
    userAddress: address,
    isLoading: isWriting || isTxLoading,
    isSuccess: isTxSuccess,
    currentTxId,

    // Operations
    createEscrow,
    releaseFunds,
    reclaimFunds,
    createDispute,

    // Utils
    setCurrentTxId,
  };
}

// Hook to read escrow details
export function useEscrowData(escrowId: string | null) {
  const { data, isError, isLoading } = useReadContract({
    address: DOMERA_CONTRACTS.escrow as `0x${string}`,
    abi: DOMERA_ESCROW_ABI,
    functionName: 'escrows',
    args: escrowId ? [BigInt(escrowId)] : undefined,
    enabled: !!escrowId && !!DOMERA_CONTRACTS.escrow,
  });

  let escrow: EscrowData | null = null;
  if (data && Array.isArray(data)) {
    escrow = {
      id: data[0],
      buyer: data[1],
      receiver: data[2],
      amount: data[3],
      timeout: data[4],
      status: data[5],
      disputeID: data[6],
      metaEvidence: data[7],
      propertyId: data[8],
      propertyTitle: data[9],
      buyerFeeRequired: data[10],
      createdAt: data[11]
    };
  }

  return {
    escrow,
    isLoading,
    isError,
  };
}