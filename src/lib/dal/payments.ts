// =============================================================================
// PAYMENTS DATA ACCESS LAYER
// Database operations for reservation payments, escrow, and traditional payments
// Following single responsibility principle - only handles payment data operations
// =============================================================================

import type {
  PaymentMethod,
  EscrowStatus,
  TraditionalPaymentStatus,
  ReservationPayment,
  EscrowTransaction,
  TraditionalPayment,
} from "@prisma/client";

import {
  type DatabaseClient,
  DatabaseError,
  NotFoundError,
  ValidationError,
  getDbClient,
  logAudit,
  type Result,
  success,
  failure,
} from "./base";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface CreateReservationPaymentInput {
  userId: string;
  operationId?: string;
  paymentMethod: PaymentMethod;
  amount: number;
  currency?: string;
  propertyData: Record<string, unknown>;
  formData: Record<string, unknown>;
}

export interface CreateEscrowTransactionInput {
  reservationPaymentId: string;
  contractAddress: string;
  senderAddress: string;
  receiverAddress: string;
  arbitratorAddress: string;
  timeoutPayment: number;
  timeoutDispute: number;
  metaEvidence: Record<string, unknown>;
  transactionHash?: string;
  blockNumber?: bigint;
  klerosTxId?: string;
}

export interface CreateTraditionalPaymentInput {
  reservationPaymentId: string;
  method: PaymentMethod;
  reference?: string;
  processorName?: string;
  paymentInstructions?: Record<string, unknown>;
  bankDetails?: Record<string, unknown>;
}

export interface UpdateEscrowTransactionInput {
  status?: EscrowStatus;
  transactionHash?: string;
  blockNumber?: bigint;
  klerosTxId?: string;
  createdOnChain?: boolean;
  fundedAt?: Date;
  disputedAt?: Date;
  completedAt?: Date;
  disputeId?: string;
  ruling?: string;
}

export interface UpdateTraditionalPaymentInput {
  status?: TraditionalPaymentStatus;
  processorTxId?: string;
  processorResponse?: Record<string, unknown>;
  confirmedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}

// =============================================================================
// RESERVATION PAYMENT OPERATIONS
// =============================================================================

export async function createReservationPayment(
  input: CreateReservationPaymentInput,
  client?: DatabaseClient
): Promise<Result<ReservationPayment>> {
  const db = client || getDbClient();

  try {
    // Validate user exists
    const userExists = await db.user.findUnique({
      where: { id: input.userId },
      select: { id: true },
    });

    if (!userExists) {
      return failure("Usuario no encontrado");
    }

    // Validate operation exists (if provided)
    if (input.operationId) {
      const operationExists = await db.operation.findUnique({
        where: { id: input.operationId },
        select: { id: true },
      });

      if (!operationExists) {
        return failure("Operación no encontrada");
      }
    }

    const payment = await db.reservationPayment.create({
      data: {
        userId: input.userId,
        operationId: input.operationId,
        paymentMethod: input.paymentMethod,
        amount: input.amount,
        currency: input.currency || "USD",
        propertyData: input.propertyData,
        formData: input.formData,
        status: "initiated",
      },
    });

    await logAudit(db, {
      userId: input.userId,
      tableName: "reservation_payments",
      recordId: payment.id,
      action: "INSERT",
      newValues: payment,
    });

    return success(payment);
  } catch (error) {
    console.error("Error creating reservation payment:", error);
    return failure("Error al crear pago de reserva");
  }
}

export async function getReservationPaymentById(
  id: string,
  client?: DatabaseClient
): Promise<Result<ReservationPayment & {
  escrowTransaction?: EscrowTransaction;
  traditionalPayment?: TraditionalPayment;
}>> {
  const db = client || getDbClient();

  try {
    const payment = await db.reservationPayment.findUnique({
      where: { id },
      include: {
        escrowTransaction: true,
        traditionalPayment: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        operation: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    if (!payment) {
      return failure("Pago de reserva no encontrado");
    }

    return success(payment);
  } catch (error) {
    console.error("Error fetching reservation payment:", error);
    return failure("Error al obtener pago de reserva");
  }
}

export async function getUserReservationPayments(
  userId: string,
  client?: DatabaseClient
): Promise<Result<ReservationPayment[]>> {
  const db = client || getDbClient();

  try {
    const payments = await db.reservationPayment.findMany({
      where: { userId },
      include: {
        escrowTransaction: true,
        traditionalPayment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return success(payments);
  } catch (error) {
    console.error("Error fetching user reservation payments:", error);
    return failure("Error al obtener pagos de reserva del usuario");
  }
}

export async function updateReservationPaymentStatus(
  id: string,
  status: string,
  completedAt?: Date,
  client?: DatabaseClient
): Promise<Result<ReservationPayment>> {
  const db = client || getDbClient();

  try {
    const existingPayment = await db.reservationPayment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return failure("Pago de reserva no encontrado");
    }

    const updatedPayment = await db.reservationPayment.update({
      where: { id },
      data: {
        status,
        completedAt,
        updatedAt: new Date(),
      },
    });

    await logAudit(db, {
      userId: existingPayment.userId,
      tableName: "reservation_payments",
      recordId: id,
      action: "UPDATE",
      oldValues: existingPayment,
      newValues: updatedPayment,
    });

    return success(updatedPayment);
  } catch (error) {
    console.error("Error updating reservation payment status:", error);
    return failure("Error al actualizar estado del pago de reserva");
  }
}

// =============================================================================
// ESCROW TRANSACTION OPERATIONS
// =============================================================================

export async function createEscrowTransaction(
  input: CreateEscrowTransactionInput,
  client?: DatabaseClient
): Promise<Result<EscrowTransaction>> {
  const db = client || getDbClient();

  try {
    // Validate reservation payment exists
    const paymentExists = await db.reservationPayment.findUnique({
      where: { id: input.reservationPaymentId },
      select: { id: true, userId: true },
    });

    if (!paymentExists) {
      return failure("Pago de reserva no encontrado");
    }

    const escrow = await db.escrowTransaction.create({
      data: {
        reservationPaymentId: input.reservationPaymentId,
        contractAddress: input.contractAddress,
        senderAddress: input.senderAddress,
        receiverAddress: input.receiverAddress,
        arbitratorAddress: input.arbitratorAddress,
        timeoutPayment: input.timeoutPayment,
        timeoutDispute: input.timeoutDispute,
        metaEvidence: input.metaEvidence,
        transactionHash: input.transactionHash,
        blockNumber: input.blockNumber,
        klerosTxId: input.klerosTxId,
        status: "created",
        createdOnChain: false,
      },
    });

    await logAudit(db, {
      userId: paymentExists.userId,
      tableName: "escrow_transactions",
      recordId: escrow.id,
      action: "INSERT",
      newValues: escrow,
    });

    return success(escrow);
  } catch (error) {
    console.error("Error creating escrow transaction:", error);
    return failure("Error al crear transacción de escrow");
  }
}

export async function updateEscrowTransaction(
  id: string,
  input: UpdateEscrowTransactionInput,
  client?: DatabaseClient
): Promise<Result<EscrowTransaction>> {
  const db = client || getDbClient();

  try {
    const existingEscrow = await db.escrowTransaction.findUnique({
      where: { id },
      include: {
        reservationPayment: {
          select: { userId: true },
        },
      },
    });

    if (!existingEscrow) {
      return failure("Transacción de escrow no encontrada");
    }

    const updatedEscrow = await db.escrowTransaction.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
    });

    await logAudit(db, {
      userId: existingEscrow.reservationPayment.userId,
      tableName: "escrow_transactions",
      recordId: id,
      action: "UPDATE",
      oldValues: existingEscrow,
      newValues: updatedEscrow,
    });

    return success(updatedEscrow);
  } catch (error) {
    console.error("Error updating escrow transaction:", error);
    return failure("Error al actualizar transacción de escrow");
  }
}

export async function getEscrowTransactionByPaymentId(
  reservationPaymentId: string,
  client?: DatabaseClient
): Promise<Result<EscrowTransaction | null>> {
  const db = client || getDbClient();

  try {
    const escrow = await db.escrowTransaction.findUnique({
      where: { reservationPaymentId },
      include: {
        reservationPayment: {
          select: {
            id: true,
            status: true,
            amount: true,
            currency: true,
          },
        },
      },
    });

    return success(escrow);
  } catch (error) {
    console.error("Error fetching escrow transaction:", error);
    return failure("Error al obtener transacción de escrow");
  }
}

// =============================================================================
// TRADITIONAL PAYMENT OPERATIONS
// =============================================================================

export async function createTraditionalPayment(
  input: CreateTraditionalPaymentInput,
  client?: DatabaseClient
): Promise<Result<TraditionalPayment>> {
  const db = client || getDbClient();

  try {
    // Validate reservation payment exists
    const paymentExists = await db.reservationPayment.findUnique({
      where: { id: input.reservationPaymentId },
      select: { id: true, userId: true },
    });

    if (!paymentExists) {
      return failure("Pago de reserva no encontrado");
    }

    const traditionalPayment = await db.traditionalPayment.create({
      data: {
        reservationPaymentId: input.reservationPaymentId,
        method: input.method,
        reference: input.reference,
        processorName: input.processorName,
        paymentInstructions: input.paymentInstructions,
        bankDetails: input.bankDetails,
        status: "initiated",
      },
    });

    await logAudit(db, {
      userId: paymentExists.userId,
      tableName: "traditional_payments",
      recordId: traditionalPayment.id,
      action: "INSERT",
      newValues: traditionalPayment,
    });

    return success(traditionalPayment);
  } catch (error) {
    console.error("Error creating traditional payment:", error);
    return failure("Error al crear pago tradicional");
  }
}

export async function updateTraditionalPayment(
  id: string,
  input: UpdateTraditionalPaymentInput,
  client?: DatabaseClient
): Promise<Result<TraditionalPayment>> {
  const db = client || getDbClient();

  try {
    const existingPayment = await db.traditionalPayment.findUnique({
      where: { id },
      include: {
        reservationPayment: {
          select: { userId: true },
        },
      },
    });

    if (!existingPayment) {
      return failure("Pago tradicional no encontrado");
    }

    const updatedPayment = await db.traditionalPayment.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
    });

    await logAudit(db, {
      userId: existingPayment.reservationPayment.userId,
      tableName: "traditional_payments",
      recordId: id,
      action: "UPDATE",
      oldValues: existingPayment,
      newValues: updatedPayment,
    });

    return success(updatedPayment);
  } catch (error) {
    console.error("Error updating traditional payment:", error);
    return failure("Error al actualizar pago tradicional");
  }
}

export async function getTraditionalPaymentByPaymentId(
  reservationPaymentId: string,
  client?: DatabaseClient
): Promise<Result<TraditionalPayment | null>> {
  const db = client || getDbClient();

  try {
    const payment = await db.traditionalPayment.findUnique({
      where: { reservationPaymentId },
      include: {
        reservationPayment: {
          select: {
            id: true,
            status: true,
            amount: true,
            currency: true,
          },
        },
      },
    });

    return success(payment);
  } catch (error) {
    console.error("Error fetching traditional payment:", error);
    return failure("Error al obtener pago tradicional");
  }
}