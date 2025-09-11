"use client";

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { KLEROS_CONTRACTS, ARBITRUM_CHAIN_ID } from '../config';
import { ESCROW_ABI, EscrowTransaction, parseEscrowTransaction } from '../contracts/escrow';

export interface CreateEscrowParams {
  receiverAddress: string;
  amount: string; // in ETH
  timeoutHours?: number;
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

    try {
      const metaEvidenceJson = JSON.stringify(params.metaEvidence);
      const timeoutPayment = (params.timeoutHours || 24) * 3600; // Convert hours to seconds
      
      writeContract({
        address: KLEROS_CONTRACTS.escrow as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'createTransaction',
        args: [
          BigInt(timeoutPayment),
          params.receiverAddress as `0x${string}`,
          metaEvidenceJson,
        ],
        value: parseEther(params.amount),
      });

      return {
        transactionHash: writeData,
        isLoading: isWriting || isTxLoading,
        isSuccess: isTxSuccess,
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

  // Pay into an existing escrow
  const payEscrow = async (transactionId: string, amount: string): Promise<EscrowOperationResult> => {
    if (!isReady) {
      return {
        error: 'Wallet not connected or not on Arbitrum network',
        isLoading: false,
        isSuccess: false,
      };
    }

    try {
      writeContract({
        address: KLEROS_CONTRACTS.escrow as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'pay',
        args: [BigInt(transactionId), parseEther(amount)],
        value: parseEther(amount),
      });

      return {
        transactionId,
        transactionHash: writeData,
        isLoading: isWriting || isTxLoading,
        isSuccess: isTxSuccess,
      };
    } catch (error) {
      console.error('Error paying escrow:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
        isSuccess: false,
      };
    }
  };

  // Execute transaction (release funds to receiver)
  const executeTransaction = async (transactionId: string): Promise<EscrowOperationResult> => {
    if (!isReady) {
      return {
        error: 'Wallet not connected or not on Arbitrum network',
        isLoading: false,
        isSuccess: false,
      };
    }

    try {
      writeContract({
        address: KLEROS_CONTRACTS.escrow as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'executeTransaction',
        args: [BigInt(transactionId)],
      });

      return {
        transactionId,
        transactionHash: writeData,
        isLoading: isWriting || isTxLoading,
        isSuccess: isTxSuccess,
      };
    } catch (error) {
      console.error('Error executing transaction:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
        isSuccess: false,
      };
    }
  };

  // Reimburse (return funds to sender)
  const reimburse = async (transactionId: string, amount: string): Promise<EscrowOperationResult> => {
    if (!isReady) {
      return {
        error: 'Wallet not connected or not on Arbitrum network',
        isLoading: false,
        isSuccess: false,
      };
    }

    try {
      writeContract({
        address: KLEROS_CONTRACTS.escrow as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'reimburse',
        args: [BigInt(transactionId), parseEther(amount)],
      });

      return {
        transactionId,
        transactionHash: writeData,
        isLoading: isWriting || isTxLoading,
        isSuccess: isTxSuccess,
      };
    } catch (error) {
      console.error('Error reimbursing:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
        isSuccess: false,
      };
    }
  };

  // Raise a dispute
  const raiseDispute = async (transactionId: string, arbitrationFee: string): Promise<EscrowOperationResult> => {
    if (!isReady) {
      return {
        error: 'Wallet not connected or not on Arbitrum network',
        isLoading: false,
        isSuccess: false,
      };
    }

    try {
      writeContract({
        address: KLEROS_CONTRACTS.escrow as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'raiseDispute',
        args: [BigInt(transactionId)],
        value: parseEther(arbitrationFee),
      });

      return {
        transactionId,
        transactionHash: writeData,
        isLoading: isWriting || isTxLoading,
        isSuccess: isTxSuccess,
      };
    } catch (error) {
      console.error('Error raising dispute:', error);
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
    payEscrow,
    executeTransaction,
    reimburse,
    raiseDispute,

    // Utils
    setCurrentTxId,
  };
}

// Hook to read escrow transaction details
export function useEscrowTransaction(transactionId: string | null) {
  const { data, isError, isLoading } = useReadContract({
    address: KLEROS_CONTRACTS.escrow as `0x${string}`,
    abi: ESCROW_ABI,
    functionName: 'transactions',
    args: transactionId ? [BigInt(transactionId)] : undefined,
    enabled: !!transactionId,
  });

  let transaction: EscrowTransaction | null = null;
  if (data && Array.isArray(data)) {
    transaction = parseEscrowTransaction(data);
  }

  return {
    transaction,
    isLoading,
    isError,
  };
}