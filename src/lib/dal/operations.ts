// =============================================================================
// OPERATIONS DATA ACCESS LAYER
// Database operations for the core business logic
// =============================================================================

import {
  getDbClient,
  DatabaseError,
  ValidationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  logAudit,
  type Result,
  success,
  failure,
} from './base';
import {
  CreateOperationSchema,
  UpdateOperationSchema,
} from '@/lib/validations/schemas';
import type { OperationStatus, Operation } from '@prisma/client';

// Input types for operations
export interface CreateOperationInput {
  unitIds: string[];
  organizationId: string;
  totalAmount: number;
  notes?: string;
}

interface UpdateOperationInput {
  status?: OperationStatus;
  notes?: string;
}

// =============================================================================
// OPERATION VALIDATION
// =============================================================================

/**
 * Check if user has an active operation
 */
export async function hasActiveOperation(
  userId: string
): Promise<Result<boolean>> {
  try {
    const client = getDbClient();

    const operation = await client.operation.findFirst({
      where: {
        userId,
        status: {
          notIn: ['completed', 'cancelled'],
        },
      },
      select: { id: true },
    });

    return success(!!operation);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

// NOTE: Unit-related validations have been moved to @/lib/dal/units.ts
// Complex operations requiring multiple DALs are handled in @/lib/services/operations.ts

// =============================================================================
// OPERATION CRUD OPERATIONS
// =============================================================================

/**
 * Create a new operation
 */
export async function createOperation(
  userId: string,
  input: CreateOperationInput,
  ipAddress?: string,
  userAgent?: string
): Promise<Result<Operation>> {
  try {
    // Validate input
    const validInput = CreateOperationSchema.parse(input);

    const client = getDbClient();

    // Create operation with provided data
    const operation = await client.operation.create({
      data: {
        userId,
        organizationId: validInput.organizationId,
        status: 'initiated',
        totalAmount: validInput.totalAmount,
        platformFee: 3000, // Fixed platform fee
        currency: 'USD',
        notes: validInput.notes,
        createdBy: userId,
      },
      include: {
        user: true,
        organization: true,
      },
    });

    // Link units to operation (price should be provided by service layer)
    const operationUnits = validInput.unitIds.map((unitId) => ({
      operationId: operation.id,
      unitId,
      // NOTE: Price should be provided by service layer that gets it from units DAL
      priceAtReservation: validInput.totalAmount / validInput.unitIds.length, // Temporary - should be actual price
    }));

    await client.operationUnit.createMany({
      data: operationUnits,
    });

    // NOTE: Unit status updates are now handled by the service layer or units DAL

    // Create operation steps
    const operationSteps = [
      {
        operationId: operation.id,
        stepName: 'document_generation',
        stepOrder: 1,
        status: 'completed' as const,
      },
      {
        operationId: operation.id,
        stepName: 'document_upload',
        stepOrder: 2,
        status: 'pending' as const,
      },
      {
        operationId: operation.id,
        stepName: 'professional_validation',
        stepOrder: 3,
        status: 'pending' as const,
      },
      {
        operationId: operation.id,
        stepName: 'payment_confirmation',
        stepOrder: 4,
        status: 'pending' as const,
      },
      {
        operationId: operation.id,
        stepName: 'operation_completion',
        stepOrder: 5,
        status: 'pending' as const,
      },
    ];

    await client.operationStep.createMany({
      data: operationSteps,
    });

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: validInput.organizationId,
      tableName: 'operations',
      recordId: operation.id,
      action: 'INSERT',
      newValues: operation,
      ipAddress,
      userAgent,
    });

    return success(operation);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

/**
 * Get operation by ID with full details
 */
export async function getOperationById(
  operationId: string,
  userId?: string
): Promise<Result<Operation>> {
  try {
    const client = getDbClient();

    const operation = await client.operation.findUnique({
      where: { id: operationId },
      include: {
        user: true,
        organization: true,
        operationUnits: {
          include: {
            unit: {
              include: {
                project: true,
              },
            },
          },
        },
        steps: true,
        professionalAssignments: {
          include: {
            professional: {
              include: {
                user: true,
              },
            },
          },
        },
        documents: true,
      },
    });

    if (!operation) {
      throw new NotFoundError('Operación', operationId);
    }

    // If userId provided, ensure user can access this operation
    if (userId && operation.userId !== userId) {
      // This will be enforced by RLS, but we add explicit check here
      throw new AuthorizationError('No tienes acceso a esta operación');
    }

    return success(operation);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

/**
 * Update operation status and details
 */
export async function updateOperation(
  operationId: string,
  userId: string,
  input: UpdateOperationInput,
  ipAddress?: string,
  userAgent?: string
): Promise<Result<Operation>> {
  try {
    const validInput = UpdateOperationSchema.parse(input);

    const client = getDbClient();

    // Get current operation for audit
    const currentResult = await getOperationById(operationId, userId);
    if (!currentResult.data) {
      return failure(currentResult.error || 'Operación no encontrada');
    }

    const currentOperation = currentResult.data;

    // Validate status transition if status is being updated
    if (validInput.status) {
      const isValidTransition = validateStatusTransition(
        currentOperation.status,
        validInput.status
      );
      if (!isValidTransition) {
        throw new ValidationError(
          `Transición de estado inválida: ${currentOperation.status} → ${validInput.status}`
        );
      }
    }

    // Update operation
    const updatedOperation = await client.operation.update({
      where: { id: operationId },
      data: validInput,
      include: {
        user: true,
        organization: true,
        operationUnits: {
          include: {
            unit: {
              include: {
                project: true,
              },
            },
          },
        },
        steps: true,
        professionalAssignments: {
          include: {
            professional: {
              include: {
                user: true,
              },
            },
          },
        },
        documents: true,
      },
    });

    // Handle status-specific actions
    if (validInput.status) {
      await handleStatusChange(client, operationId, validInput.status, userId);
    }

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: updatedOperation.organizationId,
      tableName: 'operations',
      recordId: operationId,
      action: 'UPDATE',
      oldValues: currentOperation,
      newValues: validInput,
      ipAddress,
      userAgent,
    });

    return success(updatedOperation);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

/**
 * Cancel an operation
 */
export async function cancelOperation(
  operationId: string,
  userId: string,
  reason: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Result<Operation>> {
  try {
    const client = getDbClient();

    // Get current operation
    const currentResult = await getOperationById(operationId, userId);
    if (!currentResult.data) {
      return failure(currentResult.error || 'Operación no encontrada');
    }

    const currentOperation = currentResult.data;

    // Validate that operation can be cancelled
    if (['completed', 'cancelled'].includes(currentOperation.status)) {
      throw new ValidationError(
        'No se puede cancelar una operación que ya está completada o cancelada'
      );
    }

    // Update operation to cancelled
    const cancelledOperation = await client.operation.update({
      where: { id: operationId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason: reason,
      },
      include: {
        user: true,
        organization: true,
        operationUnits: true,
      },
    });

    // NOTE: Unit status updates are now handled by the service layer
    // The service layer will call the units DAL to release units

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: cancelledOperation.organizationId,
      tableName: 'operations',
      recordId: operationId,
      action: 'UPDATE',
      oldValues: currentOperation,
      newValues: { status: 'cancelled', cancellation_reason: reason },
      ipAddress,
      userAgent,
    });

    return success(cancelledOperation);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

/**
 * Get user's active operation
 */
export async function getUserActiveOperation(
  userId: string
): Promise<Result<Operation | null>> {
  try {
    const client = getDbClient();

    const operation = await client.operation.findFirst({
      where: {
        userId,
        status: {
          notIn: ['completed', 'cancelled'],
        },
      },
      include: {
        user: true,
        organization: true,
        operationUnits: {
          include: {
            unit: {
              include: {
                project: true,
              },
            },
          },
        },
        steps: true,
        professionalAssignments: {
          include: {
            professional: {
              include: {
                user: true,
              },
            },
          },
        },
        documents: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return success(operation);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validate status transition
 */
function validateStatusTransition(
  from: OperationStatus,
  to: OperationStatus
): boolean {
  const validTransitions: Record<OperationStatus, OperationStatus[]> = {
    initiated: ['documents_pending', 'cancelled'],
    documents_pending: ['documents_uploaded', 'cancelled'],
    documents_uploaded: ['under_validation', 'documents_pending', 'cancelled'],
    under_validation: [
      'professional_assigned',
      'documents_uploaded',
      'cancelled',
    ],
    professional_assigned: [
      'waiting_signature',
      'under_validation',
      'cancelled',
    ],
    waiting_signature: [
      'signature_completed',
      'professional_assigned',
      'cancelled',
    ],
    signature_completed: ['payment_pending', 'waiting_signature', 'cancelled'],
    payment_pending: ['payment_confirmed', 'signature_completed', 'cancelled'],
    payment_confirmed: ['completed'],
    completed: [], // No transitions from completed
    cancelled: [], // No transitions from cancelled
  };

  return validTransitions[from]?.includes(to) || false;
}

/**
 * Handle status change side effect
 */
async function handleStatusChange(
  client: any,
  operationId: string,
  newStatus: OperationStatus,
  _userId: string // Prefixed with underscore to indicate intentionally unused
): Promise<void> {
  switch (newStatus) {
    case 'completed':
      // NOTE: Unit status updates (marking as sold) should be handled by service layer
      // Service layer will coordinate between operations DAL and units DAL
      break;

    case 'cancelled':
      // This is handled in the cancelOperation function
      break;

    case 'documents_uploaded':
      // Update the document_upload step
      await client.operationStep.updateMany({
        where: {
          operationId,
          stepName: 'document_upload',
        },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
      break;

    // Add more status-specific actions as needed
  }
}
