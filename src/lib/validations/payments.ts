// =============================================================================
// PAYMENT VALIDATION SCHEMAS
// Zod schemas for validating payment-related data
// =============================================================================

import { z } from "zod";

// =============================================================================
// ENUMS
// =============================================================================

export const PaymentMethodSchema = z.enum([
  "escrow",
  "traditional",
  "bank_transfer", 
  "credit_card"
]);

export const EscrowStatusSchema = z.enum([
  "created",
  "funded", 
  "disputed",
  "completed",
  "refunded",
  "expired"
]);

export const TraditionalPaymentStatusSchema = z.enum([
  "initiated",
  "pending_confirmation",
  "confirmed",
  "failed",
  "cancelled"
]);

// =============================================================================
// BASE SCHEMAS
// =============================================================================

export const PropertyDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.string(),
  location: z.string(),
}).passthrough(); // Allow additional properties

export const FormDataSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido"),
  apellido: z.string().min(1, "Apellido es requerido"),
  cedula: z.string().min(1, "Cédula es requerida"),
  telefono: z.string().min(1, "Teléfono es requerido"),
  email: z.string().email("Email inválido"),
  direccion: z.string().min(1, "Dirección es requerida"),
  ciudad: z.string().min(1, "Ciudad es requerida"),
  departamento: z.string().min(1, "Departamento es requerido"),
  codigoPostal: z.string().optional(),
  ingresos: z.string().min(1, "Ingresos son requeridos"),
  comentarios: z.string().optional(),
  useOwnNotary: z.boolean().default(false),
}).passthrough(); // Allow additional properties

// =============================================================================
// RESERVATION PAYMENT SCHEMAS
// =============================================================================

export const CreateReservationPaymentSchema = z.object({
  userId: z.string().uuid("User ID debe ser un UUID válido"),
  operationId: z.string().uuid("Operation ID debe ser un UUID válido").optional(),
  paymentMethod: PaymentMethodSchema,
  amount: z.number().positive("Monto debe ser positivo").max(10000, "Monto máximo es $10,000"),
  currency: z.string().length(3, "Código de moneda debe tener 3 caracteres").default("USD"),
  propertyData: PropertyDataSchema,
  formData: FormDataSchema,
});

export const UpdateReservationPaymentSchema = z.object({
  id: z.string().uuid("ID debe ser un UUID válido"),
  status: z.string().min(1, "Status es requerido"),
  completedAt: z.date().optional(),
});

// =============================================================================
// ESCROW TRANSACTION SCHEMAS  
// =============================================================================

export const EthereumAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Dirección Ethereum inválida");

export const TransactionHashSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Hash de transacción inválido");

export const MetaEvidenceSchema = z.object({
  title: z.string().min(1, "Título es requerido"),
  description: z.string().min(1, "Descripción es requerida"),
  question: z.string().min(1, "Pregunta es requerida"),
  rulingOptions: z.object({
    type: z.string(),
    titles: z.array(z.string()),
    descriptions: z.array(z.string()),
  }),
}).passthrough();

export const CreateEscrowTransactionSchema = z.object({
  reservationPaymentId: z.string().uuid("Reservation Payment ID debe ser un UUID válido"),
  contractAddress: EthereumAddressSchema,
  senderAddress: EthereumAddressSchema,
  receiverAddress: EthereumAddressSchema,
  arbitratorAddress: EthereumAddressSchema,
  timeoutPayment: z.number().int().positive("Timeout de pago debe ser positivo"),
  timeoutDispute: z.number().int().positive("Timeout de disputa debe ser positivo"),
  metaEvidence: MetaEvidenceSchema,
  transactionHash: TransactionHashSchema.optional(),
  blockNumber: z.bigint().optional(),
  klerosTxId: z.string().optional(),
});

export const UpdateEscrowTransactionSchema = z.object({
  id: z.string().uuid("ID debe ser un UUID válido"),
  status: EscrowStatusSchema.optional(),
  transactionHash: TransactionHashSchema.optional(),
  blockNumber: z.bigint().optional(), 
  klerosTxId: z.string().optional(),
  createdOnChain: z.boolean().optional(),
  fundedAt: z.date().optional(),
  disputedAt: z.date().optional(),
  completedAt: z.date().optional(),
  disputeId: z.string().optional(),
  ruling: z.string().optional(),
});

// =============================================================================
// TRADITIONAL PAYMENT SCHEMAS
// =============================================================================

export const PaymentInstructionsSchema = z.object({
  instructions: z.string().min(1, "Instrucciones son requeridas"),
  dueDate: z.date().optional(),
  additionalInfo: z.string().optional(),
}).passthrough();

export const BankDetailsSchema = z.object({
  bankName: z.string().min(1, "Nombre del banco es requerido"),
  accountNumber: z.string().min(1, "Número de cuenta es requerido"),
  accountHolder: z.string().min(1, "Titular de cuenta es requerido"),
  routingNumber: z.string().optional(),
  swift: z.string().optional(),
}).passthrough();

export const CreateTraditionalPaymentSchema = z.object({
  reservationPaymentId: z.string().uuid("Reservation Payment ID debe ser un UUID válido"),
  method: PaymentMethodSchema,
  reference: z.string().optional(),
  processorName: z.string().max(100, "Nombre del procesador debe tener máximo 100 caracteres").optional(),
  paymentInstructions: PaymentInstructionsSchema.optional(),
  bankDetails: BankDetailsSchema.optional(),
});

export const UpdateTraditionalPaymentSchema = z.object({
  id: z.string().uuid("ID debe ser un UUID válido"),
  status: TraditionalPaymentStatusSchema.optional(),
  processorTxId: z.string().max(255, "ID de transacción debe tener máximo 255 caracteres").optional(),
  processorResponse: z.record(z.unknown()).optional(),
  confirmedAt: z.date().optional(),
  failedAt: z.date().optional(),
  failureReason: z.string().optional(),
});

// =============================================================================
// QUERY SCHEMAS
// =============================================================================

export const GetReservationPaymentSchema = z.object({
  id: z.string().uuid("ID debe ser un UUID válido"),
});

export const GetUserReservationPaymentsSchema = z.object({
  userId: z.string().uuid("User ID debe ser un UUID válido"),
});

export const GetPaymentByIdSchema = z.object({
  paymentId: z.string().uuid("Payment ID debe ser un UUID válido"),
});

// =============================================================================
// FORM SUBMISSION SCHEMA
// =============================================================================

export const CheckoutFormSubmissionSchema = z.object({
  formData: FormDataSchema,
  paymentData: z.object({
    method: PaymentMethodSchema,
    escrowTransactionId: z.string().optional(),
    traditionalPaymentData: z.object({
      method: PaymentMethodSchema,
      amount: z.string(),
      reference: z.string().optional(),
    }).optional(),
    propertyData: PropertyDataSchema,
  }),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type EscrowStatus = z.infer<typeof EscrowStatusSchema>;
export type TraditionalPaymentStatus = z.infer<typeof TraditionalPaymentStatusSchema>;

export type PropertyData = z.infer<typeof PropertyDataSchema>;
export type FormData = z.infer<typeof FormDataSchema>;

export type CreateReservationPaymentInput = z.infer<typeof CreateReservationPaymentSchema>;
export type UpdateReservationPaymentInput = z.infer<typeof UpdateReservationPaymentSchema>;

export type CreateEscrowTransactionInput = z.infer<typeof CreateEscrowTransactionSchema>;
export type UpdateEscrowTransactionInput = z.infer<typeof UpdateEscrowTransactionSchema>;

export type CreateTraditionalPaymentInput = z.infer<typeof CreateTraditionalPaymentSchema>;
export type UpdateTraditionalPaymentInput = z.infer<typeof UpdateTraditionalPaymentSchema>;

export type CheckoutFormSubmission = z.infer<typeof CheckoutFormSubmissionSchema>;