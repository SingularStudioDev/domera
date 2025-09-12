import { PrismaClient } from "@prisma/client";
import { createSupabaseClient } from "@/lib/supabase/client";

const prisma = new PrismaClient();

export interface CreateEscrowTransactionInput {
  reservationPaymentId: string;
  contractEscrowId: string; // ID from the smart contract
  transactionHash: string;
  buyerAddress: string;
  receiverAddress: string;
  amount: string; // ETH amount as string
  timeoutTimestamp: Date;
  metaEvidence: string;
  status: string;
  blockchain: string;
}

export interface UpdateEscrowTransactionInput {
  status?: string;
  disputeId?: string;
  transactionHash?: string;
  resolvedAt?: Date;
  winnerAddress?: string;
}

export class EscrowTransactionDAL {
  /**
   * Create a new escrow transaction record
   */
  async createEscrowTransaction(input: CreateEscrowTransactionInput) {
    try {
      const escrowTransaction = await prisma.escrowTransaction.create({
        data: {
          reservationPaymentId: input.reservationPaymentId,
          contractEscrowId: input.contractEscrowId,
          transactionHash: input.transactionHash,
          buyerAddress: input.buyerAddress,
          receiverAddress: input.receiverAddress,
          amount: input.amount,
          timeoutTimestamp: input.timeoutTimestamp,
          metaEvidence: input.metaEvidence,
          status: input.status,
          blockchain: input.blockchain,
        },
        include: {
          reservationPayment: {
            include: {
              user: true,
            },
          },
        },
      });

      return escrowTransaction;
    } catch (error) {
      console.error("Error creating escrow transaction:", error);
      throw new Error("Failed to create escrow transaction");
    }
  }

  /**
   * Get escrow transaction by contract ID
   */
  async getEscrowTransactionByContractId(contractEscrowId: string) {
    try {
      const escrowTransaction = await prisma.escrowTransaction.findUnique({
        where: {
          contractEscrowId,
        },
        include: {
          reservationPayment: {
            include: {
              user: true,
            },
          },
        },
      });

      return escrowTransaction;
    } catch (error) {
      console.error("Error getting escrow transaction by contract ID:", error);
      throw new Error("Failed to get escrow transaction");
    }
  }

  /**
   * Get escrow transaction by reservation payment ID
   */
  async getEscrowTransactionByReservationId(reservationPaymentId: string) {
    try {
      const escrowTransaction = await prisma.escrowTransaction.findUnique({
        where: {
          reservationPaymentId,
        },
        include: {
          reservationPayment: {
            include: {
              user: true,
            },
          },
        },
      });

      return escrowTransaction;
    } catch (error) {
      console.error("Error getting escrow transaction by reservation ID:", error);
      throw new Error("Failed to get escrow transaction");
    }
  }

  /**
   * Update escrow transaction by contract ID
   */
  async updateEscrowTransactionByContractId(
    contractEscrowId: string,
    input: UpdateEscrowTransactionInput
  ) {
    try {
      const escrowTransaction = await prisma.escrowTransaction.update({
        where: {
          contractEscrowId,
        },
        data: {
          ...input,
          updatedAt: new Date(),
        },
        include: {
          reservationPayment: {
            include: {
              user: true,
            },
          },
        },
      });

      return escrowTransaction;
    } catch (error) {
      console.error("Error updating escrow transaction:", error);
      throw new Error("Failed to update escrow transaction");
    }
  }

  /**
   * Get all escrow transactions for a user
   */
  async getEscrowTransactionsByUserId(userId: string) {
    try {
      const escrowTransactions = await prisma.escrowTransaction.findMany({
        where: {
          reservationPayment: {
            userId,
          },
        },
        include: {
          reservationPayment: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return escrowTransactions;
    } catch (error) {
      console.error("Error getting escrow transactions by user ID:", error);
      throw new Error("Failed to get escrow transactions");
    }
  }

  /**
   * Get escrow transactions that need monitoring (active ones)
   */
  async getActiveEscrowTransactions() {
    try {
      const activeStatuses = ["created", "paid", "dispute_created"];
      
      const escrowTransactions = await prisma.escrowTransaction.findMany({
        where: {
          status: {
            in: activeStatuses,
          },
        },
        include: {
          reservationPayment: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return escrowTransactions;
    } catch (error) {
      console.error("Error getting active escrow transactions:", error);
      throw new Error("Failed to get active escrow transactions");
    }
  }

  /**
   * Get escrow transactions by status
   */
  async getEscrowTransactionsByStatus(status: string) {
    try {
      const escrowTransactions = await prisma.escrowTransaction.findMany({
        where: {
          status,
        },
        include: {
          reservationPayment: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return escrowTransactions;
    } catch (error) {
      console.error("Error getting escrow transactions by status:", error);
      throw new Error("Failed to get escrow transactions");
    }
  }

  /**
   * Mark escrow as resolved with winner
   */
  async resolveEscrowTransaction(
    contractEscrowId: string,
    winnerAddress: string,
    ruling?: number
  ) {
    try {
      const escrowTransaction = await prisma.escrowTransaction.update({
        where: {
          contractEscrowId,
        },
        data: {
          status: "resolved",
          winnerAddress,
          resolvedAt: new Date(),
          ...(ruling !== undefined && { ruling: ruling.toString() }),
          updatedAt: new Date(),
        },
        include: {
          reservationPayment: {
            include: {
              user: true,
            },
          },
        },
      });

      return escrowTransaction;
    } catch (error) {
      console.error("Error resolving escrow transaction:", error);
      throw new Error("Failed to resolve escrow transaction");
    }
  }
}