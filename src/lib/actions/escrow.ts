"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/config";
import { EscrowTransactionDAL } from "../dal/escrow-transaction";
import { createReservationPayment, getReservationPaymentById, updateReservationPaymentStatus } from "../dal/payments";

const CreateEscrowSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  propertyTitle: z.string().min(1, "Property title is required"),
  propertyData: z.object({
    id: z.string(),
    title: z.string(),
    price: z.string(),
    location: z.string(),
    projectId: z.string().optional(),
  }),
  formData: z.object({
    personalInfo: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string(),
      address: z.string(),
    }),
    paymentMethod: z.literal("escrow"),
  }),
  escrowData: z.object({
    contractEscrowId: z.string(), // ID from smart contract
    transactionHash: z.string(),
    amount: z.string(),
    receiverAddress: z.string(),
    buyerAddress: z.string(),
    timeoutTimestamp: z.number(),
    metaEvidence: z.string(),
  }),
});

export type CreateEscrowInput = z.infer<typeof CreateEscrowSchema>;

export async function createEscrowReservationAction(input: CreateEscrowInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      redirect("/auth/login");
    }

    // Validate input
    const validatedInput = CreateEscrowSchema.parse(input);

    // Create reservation payment record
    const reservationPaymentResult = await createReservationPayment({
      userId: session.user.id,
      paymentMethod: "escrow",
      amount: parseFloat(validatedInput.escrowData.amount) * 4000, // Approximate ETH to USD conversion
      currency: "USD",
      propertyData: validatedInput.propertyData,
      formData: validatedInput.formData,
    });

    if (!reservationPaymentResult.success) {
      throw new Error(`Failed to create reservation payment: ${reservationPaymentResult.error}`);
    }

    const reservationPayment = reservationPaymentResult.data;

    // Create escrow transaction record
    const escrowDAL = new EscrowTransactionDAL();
    const escrowTransaction = await escrowDAL.createEscrowTransaction({
      reservationPaymentId: reservationPayment.id,
      contractEscrowId: validatedInput.escrowData.contractEscrowId,
      transactionHash: validatedInput.escrowData.transactionHash,
      buyerAddress: validatedInput.escrowData.buyerAddress,
      receiverAddress: validatedInput.escrowData.receiverAddress,
      amount: validatedInput.escrowData.amount,
      timeoutTimestamp: new Date(
        validatedInput.escrowData.timeoutTimestamp * 1000,
      ),
      metaEvidence: validatedInput.escrowData.metaEvidence,
      status: "created",
      blockchain: "arbitrum-sepolia",
    });

    // TODO: Send confirmation email
    // TODO: Create operation record if needed

    return {
      success: true,
      data: {
        reservationPaymentId: reservationPayment.id,
        escrowTransactionId: escrowTransaction.id,
        contractEscrowId: validatedInput.escrowData.contractEscrowId,
      },
    };
  } catch (error) {
    console.error("Error creating escrow reservation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

const UpdateEscrowStatusSchema = z.object({
  contractEscrowId: z.string(),
  status: z.enum(["created", "paid", "dispute_created", "resolved"]),
  transactionHash: z.string().optional(),
  disputeId: z.string().optional(),
  winnerAddress: z.string().optional(),
});

export type UpdateEscrowStatusInput = z.infer<typeof UpdateEscrowStatusSchema>;

export async function updateEscrowStatusAction(input: UpdateEscrowStatusInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Validate input
    const validatedInput = UpdateEscrowStatusSchema.parse(input);

    // Update escrow transaction status
    const escrowDAL = new EscrowTransactionDAL();
    const escrowTransaction =
      await escrowDAL.updateEscrowTransactionByContractId(
        validatedInput.contractEscrowId,
        {
          status: validatedInput.status,
          disputeId: validatedInput.disputeId,
          ...(validatedInput.transactionHash && {
            transactionHash: validatedInput.transactionHash,
          }),
        },
      );

    if (!escrowTransaction) {
      throw new Error("Escrow transaction not found");
    }

    // Update reservation payment status based on escrow status
    let paymentStatus = "initiated";

    switch (validatedInput.status) {
      case "paid":
        paymentStatus = "payment_confirmed";
        break;
      case "dispute_created":
        paymentStatus = "under_validation";
        break;
      case "resolved":
        paymentStatus =
          validatedInput.winnerAddress === escrowTransaction.receiverAddress
            ? "completed"
            : "cancelled";
        break;
    }

    await updateReservationPaymentStatus(
      escrowTransaction.reservationPaymentId,
      paymentStatus,
    );

    return {
      success: true,
      data: {
        escrowTransactionId: escrowTransaction.id,
        status: validatedInput.status,
      },
    };
  } catch (error) {
    console.error("Error updating escrow status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

const GetEscrowTransactionSchema = z.object({
  contractEscrowId: z.string().optional(),
  reservationPaymentId: z.string().optional(),
});

export type GetEscrowTransactionInput = z.infer<
  typeof GetEscrowTransactionSchema
>;

export async function getEscrowTransactionAction(
  input: GetEscrowTransactionInput,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Validate input
    const validatedInput = GetEscrowTransactionSchema.parse(input);

    if (
      !validatedInput.contractEscrowId &&
      !validatedInput.reservationPaymentId
    ) {
      throw new Error(
        "Either contractEscrowId or reservationPaymentId is required",
      );
    }

    const escrowDAL = new EscrowTransactionDAL();
    let escrowTransaction;

    if (validatedInput.contractEscrowId) {
      escrowTransaction = await escrowDAL.getEscrowTransactionByContractId(
        validatedInput.contractEscrowId,
      );
    } else if (validatedInput.reservationPaymentId) {
      escrowTransaction = await escrowDAL.getEscrowTransactionByReservationId(
        validatedInput.reservationPaymentId,
      );
    }

    if (!escrowTransaction) {
      return {
        success: false,
        error: "Escrow transaction not found",
      };
    }

    // Check if user owns this transaction
    const reservationPaymentResult = await getReservationPaymentById(
      escrowTransaction.reservationPaymentId,
    );

    if (!reservationPaymentResult.success || reservationPaymentResult.data?.userId !== session.user.id) {
      throw new Error("Unauthorized to access this escrow transaction");
    }

    return {
      success: true,
      data: escrowTransaction,
    };
  } catch (error) {
    console.error("Error getting escrow transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
