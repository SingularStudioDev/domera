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
interface CreateOperationInput {
  unitIds: string[];
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

/**
 * Validate that units are available for reservation
 */
export async function validateUnitsAvailability(
  unitIds: string[]
): Promise<Result<boolean>> {
  try {
    const client = getDbClient();

    const units = await client.unit.findMany({
      where: {
        id: { in: unitIds },
      },
      select: {
        id: true,
        status: true,
        unitNumber: true,
      },
    });

    if (units.length !== unitIds.length) {
      throw new NotFoundError('Algunas unidades no existen');
    }

    const unavailableUnits = units.filter(
      (unit) => unit.status !== 'available'
    );
    if (unavailableUnits.length > 0) {
      const unitNumbers = unavailableUnits.map((u) => u.unitNumber).join(', ');
      throw new ConflictError(
        `Las siguientes unidades no están disponibles: ${unitNumbers}`
      );
    }

    return success(true);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

/**
 * Validate that units belong to the same organization
 */
export async function validateUnitsSameOrganization(
  unitIds: string[]
): Promise<Result<string>> {
  try {
    const client = getDbClient();

    const units = await client.unit.findMany({
      where: {
        id: { in: unitIds },
      },
      select: {
        id: true,
        projectId: true,
        project: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (units.length === 0) {
      throw new NotFoundError('Unidades no encontradas');
    }

    const organizationIds = [
      ...new Set(units.map((u) => u.project.organizationId)),
    ];
    if (organizationIds.length > 1) {
      throw new ValidationError(
        'Todas las unidades deben pertenecer a la misma organización'
      );
    }

    return success(organizationIds[0]);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

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

    // Check if user already has an active operation
    const hasActiveResult = await hasActiveOperation(userId);
    if (!hasActiveResult.data && hasActiveResult.error) {
      return failure(hasActiveResult.error);
    }
    if (hasActiveResult.data) {
      throw new ConflictError(
        'Ya tienes una operación activa. Completa o cancela la operación actual antes de iniciar una nueva.'
      );
    }

    // Validate units availability
    const availabilityResult = await validateUnitsAvailability(
      validInput.unitIds
    );
    if (!availabilityResult.data && availabilityResult.error) {
      return failure(availabilityResult.error);
    }

    // Validate units belong to same organization
    const organizationResult = await validateUnitsSameOrganization(
      validInput.unitIds
    );
    if (!organizationResult.data && organizationResult.error) {
      return failure(organizationResult.error);
    }

    const organizationId = organizationResult.data;

    // Get units with prices
    const units = await client.unit.findMany({
      where: {
        id: { in: validInput.unitIds },
      },
      select: {
        id: true,
        price: true,
      },
    });

    const totalAmount = units.reduce(
      (sum, unit) => sum + unit.price.toNumber(),
      0
    );

    // Create operation
    const operation = await client.operation.create({
      data: {
        userId,
        organizationId,
        status: 'initiated',
        totalAmount,
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

    // Link units to operation
    const operationUnits = units.map((unit) => ({
      operationId: operation.id,
      unitId: unit.id,
      priceAtReservation: unit.price,
    }));

    await client.operationUnit.createMany({
      data: operationUnits,
    });

    // Update units status to 'in_process'
    await client.unit.updateMany({
      where: {
        id: { in: validInput.unitIds },
      },
      data: {
        status: 'in_process',
      },
    });

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
      organizationId,
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

    // Release units back to available status
    const unitIds =
      cancelledOperation.operationUnits?.map((ou) => ou.unitId) || [];
    if (unitIds.length > 0) {
      try {
        await client.unit.updateMany({
          where: {
            id: { in: unitIds },
          },
          data: {
            status: 'available',
          },
        });
      } catch (unitsError) {
        console.error('Error al liberar unidades:', unitsError);
        // Don't fail the cancellation if unit release fails
      }
    }

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
        createdAt: 'desc',
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
 * Handle status change side effects
 */
async function handleStatusChange(
  client: any,
  operationId: string,
  newStatus: OperationStatus,
  userId: string
): Promise<void> {
  switch (newStatus) {
    case 'completed':
      // Mark units as sold
      const operationUnits = await client.operationUnit.findMany({
        where: { operationId },
        select: { unitId: true },
      });

      if (operationUnits && operationUnits.length > 0) {
        const unitIds = operationUnits.map((ou: any) => ou.unitId);
        await client.unit.updateMany({
          where: {
            id: { in: unitIds },
          },
          data: {
            status: 'sold',
          },
        });
      }
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
