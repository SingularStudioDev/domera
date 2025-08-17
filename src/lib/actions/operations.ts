// =============================================================================
// OPERATIONS SERVER ACTIONS
// Business logic for managing real estate operations
// =============================================================================

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { OperationStatus, UnitStatus } from '@prisma/client';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface CreateOperationInput {
  unitIds: string[];
  notes?: string;
}

interface OperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

// =============================================================================
// CORE: ONE ACTIVE OPERATION PER USER
// =============================================================================

/**
 * Check if user has an active operation
 */
export async function getUserActiveOperation(userId: string) {
  try {
    const activeOperation = await prisma.operation.findFirst({
      where: {
        userId,
        status: {
          notIn: ['completed', 'cancelled'],
        },
      },
      include: {
        operationUnits: {
          include: {
            unit: {
              include: {
                project: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    return activeOperation;
  } catch (error) {
    console.error('Error checking active operation:', error);
    return null;
  }
}

/**
 * Enforce business rule: One active operation per user
 */
async function validateOneActiveOperationRule(
  userId: string
): Promise<OperationResult> {
  const activeOperation = await getUserActiveOperation(userId);

  if (activeOperation) {
    return {
      success: false,
      error: `Ya tienes una operación activa (ID: ${activeOperation.id}). Debes completar o cancelar la operación actual antes de iniciar una nueva.`,
      data: { activeOperation },
    };
  }

  return { success: true };
}

// =============================================================================
// OPERATION CREATION AND MANAGEMENT
// =============================================================================

/**
 * Create a new operation for a user
 */
export async function createOperation(
  input: CreateOperationInput
): Promise<OperationResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // BUSINESS RULE: One active operation per user
    const validationResult = await validateOneActiveOperationRule(
      session.user.id
    );
    if (!validationResult.success) {
      return validationResult;
    }

    // Validate units exist and are available
    const units = await prisma.unit.findMany({
      where: {
        id: { in: input.unitIds },
        status: 'available',
      },
      include: {
        project: {
          select: {
            name: true,
            organizationId: true,
          },
        },
      },
    });

    if (units.length !== input.unitIds.length) {
      return {
        success: false,
        error: 'Una o más unidades no están disponibles o no existen',
      };
    }

    // Calculate total amount
    const totalAmount = units.reduce(
      (sum, unit) => sum + Number(unit.price),
      0
    );
    const platformFee = 3000.0; // Fixed platform fee from business model

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create operation
      const operation = await tx.operation.create({
        data: {
          userId: session.user.id,
          organizationId: units[0].project.organizationId, // All units should be from same org
          status: 'initiated',
          totalAmount,
          platformFee,
          currency: 'USD',
          notes: input.notes,
          createdBy: session.user.id,
        },
      });

      // Create operation-unit relationships
      const operationUnits = await Promise.all(
        units.map((unit) =>
          tx.operationUnit.create({
            data: {
              operationId: operation.id,
              unitId: unit.id,
              priceAtReservation: Number(unit.price),
            },
          })
        )
      );

      // Update unit status to 'reserved'
      await tx.unit.updateMany({
        where: { id: { in: input.unitIds } },
        data: { status: 'reserved' },
      });

      // Create initial operation steps
      const initialSteps = [
        { stepName: 'documents_upload', stepOrder: 1, status: 'pending' },
        { stepName: 'documents_validation', stepOrder: 2, status: 'pending' },
        {
          stepName: 'professional_assignment',
          stepOrder: 3,
          status: 'pending',
        },
        { stepName: 'signature_process', stepOrder: 4, status: 'pending' },
        { stepName: 'payment_confirmation', stepOrder: 5, status: 'pending' },
      ];

      const steps = await Promise.all(
        initialSteps.map((step) =>
          tx.operationStep.create({
            data: {
              ...step,
              operationId: operation.id,
            },
          })
        )
      );

      return { operation, operationUnits, steps };
    });

    revalidatePath('/dashboard');
    revalidatePath('/operations');

    return {
      success: true,
      data: result.operation,
    };
  } catch (error) {
    console.error('Error creating operation:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Cancel an active operation
 */
export async function cancelOperation(
  operationId: string,
  reason: string
): Promise<OperationResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Verify operation belongs to user
    const operation = await prisma.operation.findFirst({
      where: {
        id: operationId,
        userId: session.user.id,
        status: { notIn: ['completed', 'cancelled'] },
      },
      include: {
        operationUnits: true,
      },
    });

    if (!operation) {
      return {
        success: false,
        error: 'Operación no encontrada o no se puede cancelar',
      };
    }

    // Start transaction to cancel operation and free units
    const result = await prisma.$transaction(async (tx) => {
      // Update operation status
      const updatedOperation = await tx.operation.update({
        where: { id: operationId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: session.user.id,
          cancellationReason: reason,
        },
      });

      // Free up the units (make them available again)
      const unitIds = operation.operationUnits.map((ou) => ou.unitId);
      await tx.unit.updateMany({
        where: { id: { in: unitIds } },
        data: { status: 'available' },
      });

      return updatedOperation;
    });

    revalidatePath('/dashboard');
    revalidatePath('/operations');

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error cancelling operation:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Update operation status (for admins and professionals)
 */
export async function updateOperationStatus(
  operationId: string,
  newStatus: OperationStatus,
  notes?: string
): Promise<OperationResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Check if user has permission to update operations
    const hasPermission = session.user.roles.some((role) =>
      ['admin', 'organization_owner', 'sales_manager', 'professional'].includes(
        role.role
      )
    );

    if (!hasPermission) {
      return {
        success: false,
        error: 'No tienes permisos para actualizar operaciones',
      };
    }

    const updatedOperation = await prisma.operation.update({
      where: { id: operationId },
      data: {
        status: newStatus,
        ...(newStatus === 'completed' && { completedAt: new Date() }),
        ...(notes && { notes }),
      },
    });

    // If operation is completed, make units unavailable (sold)
    if (newStatus === 'completed') {
      await prisma.$transaction(async (tx) => {
        const operationUnits = await tx.operationUnit.findMany({
          where: { operationId },
        });

        const unitIds = operationUnits.map((ou) => ou.unitId);
        await tx.unit.updateMany({
          where: { id: { in: unitIds } },
          data: { status: 'sold' },
        });
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/operations');
    revalidatePath('/admin');

    return {
      success: true,
      data: updatedOperation,
    };
  } catch (error) {
    console.error('Error updating operation status:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Get all operations for current user
 */
export async function getUserOperations(): Promise<OperationResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const operations = await prisma.operation.findMany({
      where: { userId: session.user.id },
      include: {
        operationUnits: {
          include: {
            unit: {
              include: {
                project: {
                  select: {
                    name: true,
                    slug: true,
                    address: true,
                  },
                },
              },
            },
          },
        },
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: operations,
    };
  } catch (error) {
    console.error('Error fetching user operations:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}
