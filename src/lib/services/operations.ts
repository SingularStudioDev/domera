// =============================================================================
// OPERATIONS SERVICE LAYER
// Business logic that coordinates between different DAL modules
// Handles complex operations that involve multiple models
// =============================================================================

import {
  ConflictError,
  failure,
  success,
  ValidationError,
  type Result,
} from "@/lib/dal/base";
import {
  createOperation as createOperationDAL,
  hasActiveOperation,
  type CreateOperationInput,
} from "@/lib/dal/operations";
import {
  getUnitsWithOrganization,
  updateUnitsStatus,
  validateUnitsAvailability,
} from "@/lib/dal/units";

// =============================================================================
// BUSINESS LOGIC FUNCTIONS
// =============================================================================

/**
 * Validate units belong to same organization
 * This is business logic that coordinates between units and projects
 */
export async function validateUnitsSameOrganization(
  unitIds: string[],
): Promise<Result<string>> {
  try {
    const unitsResult = await getUnitsWithOrganization(unitIds);
    if (!unitsResult.data) {
      return failure(unitsResult.error || "Error al obtener unidades");
    }

    const units = unitsResult.data;
    const organizationIds = [...new Set(units.map((u) => u.organizationId))];

    if (organizationIds.length > 1) {
      throw new ValidationError(
        "Todas las unidades deben pertenecer a la misma organización",
      );
    }

    return success(organizationIds[0]);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Create operation with full business logic validation
 * Coordinates between operations, units, and projects DALs
 */
export async function createOperationWithValidation(
  userId: string,
  input: { unitIds: string[]; notes?: string },
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<any>> {
  try {
    // Check if user already has an active operation
    const hasActiveResult = await hasActiveOperation(userId);
    if (!hasActiveResult.data && hasActiveResult.error) {
      return failure(hasActiveResult.error);
    }
    if (hasActiveResult.data) {
      throw new ConflictError(
        "Ya tienes una operación activa. Completa o cancela la operación actual antes de iniciar una nueva.",
      );
    }

    // Validate units availability
    const availabilityResult = await validateUnitsAvailability(input.unitIds);
    if (!availabilityResult.data && availabilityResult.error) {
      return failure(availabilityResult.error);
    }

    // Validate units belong to same organization
    const organizationResult = await validateUnitsSameOrganization(
      input.unitIds,
    );
    if (!organizationResult.data && organizationResult.error) {
      return failure(organizationResult.error);
    }

    const organizationId = organizationResult.data;

    // Get units with pricing info
    const unitsResult = await getUnitsWithOrganization(input.unitIds);
    if (!unitsResult.data) {
      return failure(
        unitsResult.error || "Error al obtener información de unidades",
      );
    }

    const units = unitsResult.data;
    const totalAmount = units.reduce((sum, unit) => sum + unit.price, 0);

    // Create the operation
    const operationInput: CreateOperationInput = {
      unitIds: input.unitIds,
      organizationId,
      totalAmount,
      notes: input.notes,
    };

    const operationResult = await createOperationDAL(
      userId,
      operationInput,
      ipAddress,
      userAgent,
    );
    if (!operationResult.data) {
      return failure(operationResult.error || "Error al crear operación");
    }

    // Update units status to 'reserved' - CRITICAL: This must succeed
    console.log(`[SERVICE] Attempting to update ${input.unitIds.length} units to 'reserved' status:`, input.unitIds);
    
    const statusUpdateResult = await updateUnitsStatus(
      input.unitIds,
      "reserved",
      userId,
      ipAddress,
      userAgent,
    );

    console.log(`[SERVICE] Unit status update result:`, {
      success: statusUpdateResult.data,
      error: statusUpdateResult.error
    });

    if (!statusUpdateResult.data) {
      console.error("CRITICAL: Error updating unit status after operation creation:", statusUpdateResult.error);
      // If status update fails, the operation should not be considered successful
      // The operation exists in DB but units are not properly reserved
      return failure(
        `Operación creada pero error actualizando estado de unidades: ${statusUpdateResult.error}. Contacte al administrador.`
      );
    }

    console.log(`[SERVICE] Successfully updated ${input.unitIds.length} units to 'reserved' status`);

    return success(operationResult.data);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Cancel operation and release units
 * Coordinates between operations and units DALs
 */
export async function cancelOperationWithUnitsRelease(
  operationId: string,
  userId: string,
  reason: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<any>> {
  try {
    // Import operations DAL function
    const { getOperationById, cancelOperation } = await import("@/lib/dal/operations");
    
    // Get the operation to find associated units
    const operationResult = await getOperationById(operationId, userId);
    if (!operationResult.data) {
      return failure(operationResult.error || "Operación no encontrada");
    }

    const operation = operationResult.data;
    
    // Extract unit IDs from operation units
    const unitIds = operation.operationUnits?.map((ou: any) => ou.unitId) || [];
    
    // Cancel the operation first
    const cancelResult = await cancelOperation(operationId, userId, reason, ipAddress, userAgent);
    if (!cancelResult.data) {
      return failure(cancelResult.error || "Error al cancelar operación");
    }

    // Release units back to available status
    if (unitIds.length > 0) {
      const statusUpdateResult = await updateUnitsStatus(
        unitIds,
        "available",
        userId,
        ipAddress,
        userAgent,
      );
      
      if (!statusUpdateResult.data) {
        console.error("Error releasing unit status:", statusUpdateResult.error);
        // Don't fail the cancellation if status update fails
      }
    }

    return success(cancelResult.data);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Complete operation and mark units as sold
 * Coordinates between operations and units DALs
 */
export async function completeOperationWithUnitsSold(
  operationId: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<any>> {
  try {
    // Import operations DAL function
    const { getOperationById, completeOperation } = await import("@/lib/dal/operations");
    
    // Get the operation to find associated units
    const operationResult = await getOperationById(operationId, userId);
    if (!operationResult.data) {
      return failure(operationResult.error || "Operación no encontrada");
    }

    const operation = operationResult.data;
    
    // Extract unit IDs from operation units
    const unitIds = operation.operationUnits?.map((ou: any) => ou.unitId) || [];
    
    // Complete the operation first
    const completeResult = await completeOperation(operationId, userId, ipAddress, userAgent);
    if (!completeResult.data) {
      return failure(completeResult.error || "Error al completar operación");
    }

    // Mark units as sold
    if (unitIds.length > 0) {
      const statusUpdateResult = await updateUnitsStatus(
        unitIds,
        "sold",
        userId,
        ipAddress,
        userAgent,
      );
      
      if (!statusUpdateResult.data) {
        console.error("Error updating unit status to sold:", statusUpdateResult.error);
        // Don't fail the completion if status update fails
      }
    }

    return success(completeResult.data);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}
