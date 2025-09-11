// Simplified ABI for MultipleArbitrableTransaction contract
export const ESCROW_ABI = [
  // Create transaction
  {
    "inputs": [
      {"internalType": "uint256", "name": "_timeoutPayment", "type": "uint256"},
      {"internalType": "address payable", "name": "_receiver", "type": "address"},
      {"internalType": "string", "name": "_metaEvidence", "type": "string"}
    ],
    "name": "createTransaction",
    "outputs": [{"internalType": "uint256", "name": "transactionId", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  // Pay
  {
    "inputs": [
      {"internalType": "uint256", "name": "_transactionId", "type": "uint256"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "pay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Reimburse
  {
    "inputs": [
      {"internalType": "uint256", "name": "_transactionId", "type": "uint256"},
      {"internalType": "uint256", "name": "_amountReimbursed", "type": "uint256"}
    ],
    "name": "reimburse",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Execute transaction
  {
    "inputs": [{"internalType": "uint256", "name": "_transactionId", "type": "uint256"}],
    "name": "executeTransaction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Raise dispute
  {
    "inputs": [{"internalType": "uint256", "name": "_transactionId", "type": "uint256"}],
    "name": "raiseDispute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // Submit evidence
  {
    "inputs": [
      {"internalType": "uint256", "name": "_transactionId", "type": "uint256"},
      {"internalType": "string", "name": "_evidence", "type": "string"}
    ],
    "name": "submitEvidence",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Get transaction info
  {
    "inputs": [{"internalType": "uint256", "name": "_transactionId", "type": "uint256"}],
    "name": "transactions",
    "outputs": [
      {"internalType": "address", "name": "sender", "type": "address"},
      {"internalType": "address payable", "name": "receiver", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "timeoutPayment", "type": "uint256"},
      {"internalType": "uint256", "name": "disputeId", "type": "uint256"},
      {"internalType": "uint256", "name": "senderFee", "type": "uint256"},
      {"internalType": "uint256", "name": "receiverFee", "type": "uint256"},
      {"internalType": "uint256", "name": "lastInteraction", "type": "uint256"},
      {"internalType": "enum MultipleArbitrableTransaction.Status", "name": "status", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "_transactionId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "_sender", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "_receiver", "type": "address"}
    ],
    "name": "TransactionCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "_transactionId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "_sender", "type": "address"}
    ],
    "name": "Payment",
    "type": "event"
  }
] as const;

// Transaction status enum
export enum TransactionStatus {
  NoDispute = 0,
  WaitingReceiver = 1,
  WaitingSender = 2,
  DisputeCreated = 3,
  Resolved = 4
}

// Transaction interface
export interface EscrowTransaction {
  sender: string;
  receiver: string;
  amount: bigint;
  timeoutPayment: bigint;
  disputeId: bigint;
  senderFee: bigint;
  receiverFee: bigint;
  lastInteraction: bigint;
  status: TransactionStatus;
}

// Utility functions
export function parseEscrowTransaction(data: unknown[]): EscrowTransaction {
  return {
    sender: data[0],
    receiver: data[1],
    amount: data[2],
    timeoutPayment: data[3],
    disputeId: data[4],
    senderFee: data[5],
    receiverFee: data[6],
    lastInteraction: data[7],
    status: data[8] as TransactionStatus,
  };
}

export function formatTransactionStatus(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.NoDispute:
      return 'Sin disputa';
    case TransactionStatus.WaitingReceiver:
      return 'Esperando receptor';
    case TransactionStatus.WaitingSender:
      return 'Esperando remitente';
    case TransactionStatus.DisputeCreated:
      return 'Disputa creada';
    case TransactionStatus.Resolved:
      return 'Resuelta';
    default:
      return 'Estado desconocido';
  }
}