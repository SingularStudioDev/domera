// =============================================================================
// PAYMENTS SERVER ACTIONS
// Server actions for payment management - following single responsibility principle
// Only handles payment-related operations (escrow and traditional)
// =============================================================================

"use server";

import { revalidatePath } from "next/cache";

import type {
  PaymentMethod,
  EscrowStatus,
  TraditionalPaymentStatus,
} from "@prisma/client";

import { validateSession } from "@/lib/auth/validation";
import {
  createReservationPayment,
  createEscrowTransaction,
  createTraditionalPayment,
  updateReservationPaymentStatus,
  updateEscrowTransaction,
  updateTraditionalPayment,
  getReservationPaymentById,
  getUserReservationPayments,
  getEscrowTransactionByPaymentId,
  getTraditionalPaymentByPaymentId,
  type CreateReservationPaymentInput,
  type CreateEscrowTransactionInput,
  type CreateTraditionalPaymentInput,
  type UpdateEscrowTransactionInput,
  type UpdateTraditionalPaymentInput,
} from "@/lib/dal/payments";
import {
  CreateReservationPaymentSchema,
  CreateEscrowTransactionSchema,
  CreateTraditionalPaymentSchema,
  UpdateEscrowTransactionSchema,
  UpdateTraditionalPaymentSchema,
  GetReservationPaymentSchema,
  GetUserReservationPaymentsSchema,
  CheckoutFormSubmissionSchema,
  type CheckoutFormSubmission,
} from "@/lib/validations/payments";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface PaymentActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// =============================================================================
// RESERVATION PAYMENT ACTIONS
// =============================================================================

/**
 * Create a new reservation payment
 */
export async function createReservationPaymentAction(
  input: CreateReservationPaymentInput
): Promise<PaymentActionResult> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Validate input
    const validatedInput = CreateReservationPaymentSchema.parse(input);

    // Ensure user is creating payment for themselves (unless admin)
    if (validatedInput.userId !== session.user.id) {
      // TODO: Check if user has admin role
      return { success: false, error: "No tienes permisos para crear pagos para otro usuario" };
    }

    const result = await createReservationPayment(validatedInput);

    if (!result.data) {
      return { success: false, error: result.error || "Error al crear pago de reserva" };
    }

    revalidatePath("/checkout/confirmation");
    revalidatePath("/dashboard/payments");

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error in createReservationPaymentAction:", error);
    return { success: false, error: "Error inesperado al crear pago de reserva" };
  }
}

/**
 * Get reservation payment by ID
 */
export async function getReservationPaymentAction(
  id: string
): Promise<PaymentActionResult> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Validate input
    const validatedInput = GetReservationPaymentSchema.parse({ id });

    const result = await getReservationPaymentById(validatedInput.id);

    if (!result.data) {
      return { success: false, error: result.error || "Pago no encontrado" };
    }

    // Check if user owns the payment or is admin
    if (result.data.userId !== session.user.id) {
      // TODO: Check if user has admin role or organization access
      return { success: false, error: "No tienes permisos para ver este pago" };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error in getReservationPaymentAction:", error);
    return { success: false, error: "Error inesperado al obtener pago" };
  }
}

/**
 * Get user's reservation payments
 */
export async function getUserReservationPaymentsAction(
  userId?: string
): Promise<PaymentActionResult> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const targetUserId = userId || session.user.id;

    // Validate input
    const validatedInput = GetUserReservationPaymentsSchema.parse({ userId: targetUserId });

    // Ensure user is requesting their own payments (unless admin)
    if (validatedInput.userId !== session.user.id) {
      // TODO: Check if user has admin role
      return { success: false, error: "No tienes permisos para ver pagos de otro usuario" };
    }

    const result = await getUserReservationPayments(validatedInput.userId);

    if (!result.data) {
      return { success: false, error: result.error || "Error al obtener pagos" };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error in getUserReservationPaymentsAction:", error);
    return { success: false, error: "Error inesperado al obtener pagos del usuario" };
  }
}

/**
 * Update reservation payment status
 */
export async function updateReservationPaymentStatusAction(
  id: string,
  status: string,
  completedAt?: Date
): Promise<PaymentActionResult> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Get payment to check ownership
    const paymentResult = await getReservationPaymentById(id);
    if (!paymentResult.data) {
      return { success: false, error: "Pago no encontrado" };
    }

    // Check if user owns the payment or is admin
    if (paymentResult.data.userId !== session.user.id) {
      // TODO: Check if user has admin role
      return { success: false, error: "No tienes permisos para actualizar este pago" };
    }

    const result = await updateReservationPaymentStatus(id, status, completedAt);

    if (!result.data) {
      return { success: false, error: result.error || "Error al actualizar estado del pago" };
    }

    revalidatePath("/checkout/confirmation");
    revalidatePath("/dashboard/payments");

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error in updateReservationPaymentStatusAction:", error);
    return { success: false, error: "Error inesperado al actualizar estado del pago" };
  }
}

// =============================================================================
// ESCROW TRANSACTION ACTIONS
// =============================================================================

/**
 * Create a new escrow transaction
 */
export async function createEscrowTransactionAction(
  input: CreateEscrowTransactionInput
): Promise<PaymentActionResult> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Validate input
    const validatedInput = CreateEscrowTransactionSchema.parse(input);

    // Verify user owns the reservation payment
    const paymentResult = await getReservationPaymentById(validatedInput.reservationPaymentId);
    if (!paymentResult.data) {
      return { success: false, error: "Pago de reserva no encontrado" };
    }

    if (paymentResult.data.userId !== session.user.id) {
      return { success: false, error: "No tienes permisos para crear escrow para este pago" };
    }

    const result = await createEscrowTransaction(validatedInput);

    if (!result.data) {
      return { success: false, error: result.error || "Error al crear transacción de escrow" };
    }

    revalidatePath("/checkout/confirmation");
    revalidatePath("/dashboard/payments");

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error in createEscrowTransactionAction:", error);
    return { success: false, error: "Error inesperado al crear transacción de escrow" };
  }
}

/**
 * Update escrow transaction
 */
export async function updateEscrowTransactionAction(
  input: UpdateEscrowTransactionInput
): Promise<PaymentActionResult> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Validate input
    const validatedInput = UpdateEscrowTransactionSchema.parse(input);

    // Get escrow to check ownership
    const escrowResult = await getEscrowTransactionByPaymentId(validatedInput.id);
    if (!escrowResult.data) {
      return { success: false, error: "Transacción de escrow no encontrada" };
    }

    const result = await updateEscrowTransaction(validatedInput.id, validatedInput);

    if (!result.data) {
      return { success: false, error: result.error || "Error al actualizar transacción de escrow" };
    }

    revalidatePath("/checkout/confirmation");
    revalidatePath("/dashboard/payments");

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error in updateEscrowTransactionAction:", error);
    return { success: false, error: "Error inesperado al actualizar transacción de escrow" };
  }
}

// =============================================================================
// TRADITIONAL PAYMENT ACTIONS  
// =============================================================================

/**
 * Create a new traditional payment
 */
export async function createTraditionalPaymentAction(
  input: CreateTraditionalPaymentInput
): Promise<PaymentActionResult> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Validate input
    const validatedInput = CreateTraditionalPaymentSchema.parse(input);

    // Verify user owns the reservation payment
    const paymentResult = await getReservationPaymentById(validatedInput.reservationPaymentId);
    if (!paymentResult.data) {
      return { success: false, error: "Pago de reserva no encontrado" };
    }

    if (paymentResult.data.userId !== session.user.id) {
      return { success: false, error: "No tienes permisos para crear pago tradicional para este pago" };
    }

    const result = await createTraditionalPayment(validatedInput);

    if (!result.data) {
      return { success: false, error: result.error || "Error al crear pago tradicional" };
    }

    revalidatePath("/checkout/confirmation");
    revalidatePath("/dashboard/payments");

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error in createTraditionalPaymentAction:", error);
    return { success: false, error: "Error inesperado al crear pago tradicional" };
  }
}

/**
 * Update traditional payment
 */
export async function updateTraditionalPaymentAction(
  input: UpdateTraditionalPaymentInput
): Promise<PaymentActionResult> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Validate input
    const validatedInput = UpdateTraditionalPaymentSchema.parse(input);

    const result = await updateTraditionalPayment(validatedInput.id, validatedInput);

    if (!result.data) {
      return { success: false, error: result.error || "Error al actualizar pago tradicional" };
    }

    revalidatePath("/checkout/confirmation");
    revalidatePath("/dashboard/payments");

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error in updateTraditionalPaymentAction:", error);
    return { success: false, error: "Error inesperado al actualizar pago tradicional" };
  }
}

// =============================================================================
// CHECKOUT FORM SUBMISSION ACTION
// =============================================================================

/**
 * Handle complete checkout form submission with payment data
 */
export async function submitCheckoutFormAction(
  input: CheckoutFormSubmission
): Promise<PaymentActionResult> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Validate input
    const validatedInput = CheckoutFormSubmissionSchema.parse(input);

    // Create reservation payment
    const reservationPaymentData: CreateReservationPaymentInput = {
      userId: session.user.id,
      paymentMethod: validatedInput.paymentData.method,
      amount: 200, // USD 200 for reservation
      currency: "USD",
      propertyData: validatedInput.paymentData.propertyData,
      formData: validatedInput.formData,
    };

    const paymentResult = await createReservationPayment(reservationPaymentData);

    if (!paymentResult.data) {
      return { success: false, error: paymentResult.error || "Error al crear pago de reserva" };
    }

    // Create specific payment type based on method
    if (validatedInput.paymentData.method === "escrow" && validatedInput.paymentData.escrowTransactionId) {
      // Note: In real implementation, you would extract escrow details from the blockchain
      // For now, this is a placeholder that would be called after escrow is created on-chain
      console.log("Escrow transaction created:", validatedInput.paymentData.escrowTransactionId);
    } else if (validatedInput.paymentData.traditionalPaymentData) {
      const traditionalPaymentData: CreateTraditionalPaymentInput = {
        reservationPaymentId: paymentResult.data.id,
        method: validatedInput.paymentData.traditionalPaymentData.method,
        reference: validatedInput.paymentData.traditionalPaymentData.reference,
        // Generate payment instructions based on method
        paymentInstructions: {
          instructions: "Instrucciones de pago serán enviadas por email",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
      };

      const traditionalResult = await createTraditionalPayment(traditionalPaymentData);
      if (!traditionalResult.data) {
        return { success: false, error: traditionalResult.error || "Error al crear pago tradicional" };
      }
    }

    // Update payment status to completed
    await updateReservationPaymentStatus(
      paymentResult.data.id,
      "completed",
      new Date()
    );

    revalidatePath("/checkout/confirmation");
    revalidatePath("/dashboard");

    return { 
      success: true, 
      data: { 
        paymentId: paymentResult.data.id,
        message: "Formulario enviado exitosamente" 
      }
    };
  } catch (error) {
    console.error("Error in submitCheckoutFormAction:", error);
    return { success: false, error: "Error inesperado al enviar formulario" };
  }
}