// =============================================================================
// OPERATIONS SERVICE LAYER
// Business logic that coordinates between different DAL modules
// Handles complex operations that involve multiple models
// =============================================================================

import { validateUnitsAvailability, getUnitsWithOrganization, updateUnitsStatus } from '@/lib/dal/units';
import { hasActiveOperation, createOperation as createOperationDAL, type CreateOperationInput } from '@/lib/dal/operations';
import { ValidationError, ConflictError, type Result, success, failure } from '@/lib/dal/base';

// =============================================================================
// BUSINESS LOGIC FUNCTIONS
// =============================================================================

/**
 * Validate units belong to same organization
 * This is business logic that coordinates between units and projects
 */
export async function validateUnitsSameOrganization(unitIds: string[]): Promise<Result<string>> {
  try {
    const unitsResult = await getUnitsWithOrganization(unitIds);
    if (!unitsResult.data) {
      return failure(unitsResult.error || 'Error al obtener unidades');
    }

    const units = unitsResult.data;
    const organizationIds = [...new Set(units.map(u => u.organizationId))];
    
    if (organizationIds.length > 1) {
      throw new ValidationError('Todas las unidades deben pertenecer a la misma organización');
    }

    return success(organizationIds[0]);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
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
  userAgent?: string
): Promise<Result<any>> {
  try {
    // Check if user already has an active operation
    const hasActiveResult = await hasActiveOperation(userId);
    if (!hasActiveResult.data && hasActiveResult.error) {
      return failure(hasActiveResult.error);
    }
    if (hasActiveResult.data) {
      throw new ConflictError('Ya tienes una operación activa. Completa o cancela la operación actual antes de iniciar una nueva.');
    }

    // Validate units availability
    const availabilityResult = await validateUnitsAvailability(input.unitIds);
    if (!availabilityResult.data && availabilityResult.error) {
      return failure(availabilityResult.error);
    }

    // Validate units belong to same organization
    const organizationResult = await validateUnitsSameOrganization(input.unitIds);
    if (!organizationResult.data && organizationResult.error) {
      return failure(organizationResult.error);
    }

    const organizationId = organizationResult.data;

    // Get units with pricing info
    const unitsResult = await getUnitsWithOrganization(input.unitIds);
    if (!unitsResult.data) {
      return failure(unitsResult.error || 'Error al obtener información de unidades');
    }

    const units = unitsResult.data;
    const totalAmount = units.reduce((sum, unit) => sum + unit.price, 0);

    // Create the operation
    const operationInput: CreateOperationInput = {
      unitIds: input.unitIds,
      organizationId,
      totalAmount,
      notes: input.notes
    };

    const operationResult = await createOperationDAL(userId, operationInput, ipAddress, userAgent);
    if (!operationResult.data) {
      return failure(operationResult.error || 'Error al crear operación');
    }

    // Update units status to 'in_process'
    const statusUpdateResult = await updateUnitsStatus(
      input.unitIds,
      'in_process',
      userId,
      ipAddress,
      userAgent
    );

    if (!statusUpdateResult.data) {
      console.error('Error updating unit status:', statusUpdateResult.error);
      // Don't fail the operation creation if status update fails
    }

    return success(operationResult.data);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
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
  userAgent?: string
): Promise<Result<any>> {
  try {
    // First, get the operation to find associated units
    // This should be done through the operations DAL
    // ... implementation would use operations DAL methods
    
    // Then release units back to available status
    // This would use the units DAL
    
    // This is a placeholder - the actual implementation would coordinate
    // between the operations DAL and units DAL
    
    return success(true);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}