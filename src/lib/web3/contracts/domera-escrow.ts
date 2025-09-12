// ABI and types for DomeraEscrow contract

export const DOMERA_ESCROW_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {"name": "_arbitrator", "type": "address"},
      {"name": "_arbitratorExtraData", "type": "bytes"}
    ]
  },
  {
    "type": "function",
    "name": "createEscrow",
    "inputs": [
      {"name": "_receiver", "type": "address"},
      {"name": "_timeout", "type": "uint256"},
      {"name": "_metaEvidence", "type": "string"},
      {"name": "_propertyId", "type": "string"},
      {"name": "_propertyTitle", "type": "string"}
    ],
    "outputs": [{"name": "escrowID", "type": "uint256"}],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "releaseFunds",
    "inputs": [{"name": "_escrowID", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "reclaimFunds",
    "inputs": [{"name": "_escrowID", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createDispute",
    "inputs": [{"name": "_escrowID", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "rule",
    "inputs": [
      {"name": "_disputeID", "type": "uint256"},
      {"name": "_ruling", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getEscrow",
    "inputs": [{"name": "_escrowID", "type": "uint256"}],
    "outputs": [
      {"name": "buyer", "type": "address"},
      {"name": "receiver", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "timeout", "type": "uint256"},
      {"name": "status", "type": "uint8"},
      {"name": "propertyId", "type": "string"},
      {"name": "propertyTitle", "type": "string"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCurrentEscrowId",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "escrows",
    "inputs": [{"name": "", "type": "uint256"}],
    "outputs": [
      {"name": "id", "type": "uint256"},
      {"name": "buyer", "type": "address"},
      {"name": "receiver", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "timeout", "type": "uint256"},
      {"name": "status", "type": "uint8"},
      {"name": "disputeID", "type": "uint256"},
      {"name": "metaEvidence", "type": "string"},
      {"name": "propertyId", "type": "string"},
      {"name": "propertyTitle", "type": "string"},
      {"name": "buyerFeeRequired", "type": "bool"},
      {"name": "createdAt", "type": "uint256"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "EscrowCreated",
    "inputs": [
      {"indexed": true, "name": "escrowID", "type": "uint256"},
      {"indexed": true, "name": "buyer", "type": "address"},
      {"indexed": true, "name": "receiver", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "propertyId", "type": "string"}
    ]
  },
  {
    "type": "event",
    "name": "Payment",
    "inputs": [
      {"indexed": true, "name": "escrowID", "type": "uint256"},
      {"indexed": true, "name": "payer", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ]
  },
  {
    "type": "event",
    "name": "DisputeCreated",
    "inputs": [
      {"indexed": true, "name": "escrowID", "type": "uint256"},
      {"indexed": true, "name": "disputeID", "type": "uint256"}
    ]
  },
  {
    "type": "event",
    "name": "EscrowResolved",
    "inputs": [
      {"indexed": true, "name": "escrowID", "type": "uint256"},
      {"indexed": true, "name": "winner", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ]
  },
  {
    "type": "event",
    "name": "Ruling",
    "inputs": [
      {"indexed": true, "name": "escrowID", "type": "uint256"},
      {"indexed": true, "name": "disputeID", "type": "uint256"},
      {"indexed": false, "name": "ruling", "type": "uint256"}
    ]
  }
] as const;

// Enum for escrow status matching the smart contract
export enum EscrowStatus {
  Created = 0,
  Paid = 1,
  DisputeCreated = 2,
  Resolved = 3
}

// Interface for escrow data
export interface EscrowData {
  id: bigint;
  buyer: string;
  receiver: string;
  amount: bigint;
  timeout: bigint;
  status: EscrowStatus;
  disputeID: bigint;
  metaEvidence: string;
  propertyId: string;
  propertyTitle: string;
  buyerFeeRequired: boolean;
  createdAt: bigint;
}

// Helper function to parse escrow data from contract response
export function parseEscrowData(data: any[]): EscrowData {
  return {
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