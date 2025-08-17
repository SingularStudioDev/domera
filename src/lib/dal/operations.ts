// =============================================================================
// OPERATIONS DATA ACCESS LAYER
// Database operations for the core business logic
// Created: August 2025
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
  failure
} from './base';
import type {
  Operation,
  OperationUnit,
  OperationStep,
  Unit,
  CreateOperationInput,
  UpdateOperationInput,
  OperationStatus
} from '@/types/database';
import { CreateOperationSchema, UpdateOperationSchema } from '@/lib/validations/schemas';

// =============================================================================
// OPERATION VALIDATION
// =============================================================================

/**
 * Check if user has an active operation
 */
export async function hasActiveOperation(userId: string): Promise<Result<boolean>> {
  try {
    const client = await getDbClient();
    
    const { data, error } = await client
      .from('operations')
      .select('id')
      .eq('user_id', userId)
      .not('status', 'in', '("completed","cancelled")')
      .limit(1);

    if (error) {
      throw new DatabaseError('Error al verificar operación activa', error.code, error);
    }

    return success(data.length > 0);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}

/**
 * Validate that units are available for reservation
 */
export async function validateUnitsAvailability(unitIds: string[]): Promise<Result<boolean>> {
  try {
    const client = await getDbClient();
    
    const { data: units, error } = await client
      .from('units')
      .select('id, status, unit_number')
      .in('id', unitIds);

    if (error) {
      throw new DatabaseError('Error al verificar disponibilidad de unidades', error.code, error);
    }

    if (units.length !== unitIds.length) {
      throw new NotFoundError('Algunas unidades no existen');
    }

    const unavailableUnits = units.filter(unit => unit.status !== 'available');
    if (unavailableUnits.length > 0) {
      const unitNumbers = unavailableUnits.map(u => u.unit_number).join(', ');
      throw new ConflictError(`Las siguientes unidades no están disponibles: ${unitNumbers}`);
    }

    return success(true);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}

/**
 * Validate that units belong to the same organization
 */
export async function validateUnitsSameOrganization(unitIds: string[]): Promise<Result<string>> {
  try {
    const client = await getDbClient();
    
    const { data: units, error } = await client
      .from('units')
      .select(`
        id,
        project_id,
        projects!inner(organization_id)
      `)
      .in('id', unitIds);

    if (error) {
      throw new DatabaseError('Error al verificar organización de unidades', error.code, error);
    }

    if (units.length === 0) {
      throw new NotFoundError('Unidades no encontradas');
    }

    const organizationIds = [...new Set(units.map(u => u.projects.organization_id))];
    if (organizationIds.length > 1) {
      throw new ValidationError('Todas las unidades deben pertenecer a la misma organización');
    }

    return success(organizationIds[0]);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
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
    
    const client = await getDbClient();

    // Check if user already has an active operation
    const hasActiveResult = await hasActiveOperation(userId);
    if (!hasActiveResult.data && hasActiveResult.error) {
      return failure(hasActiveResult.error);
    }
    if (hasActiveResult.data) {
      throw new ConflictError('Ya tienes una operación activa. Completa o cancela la operación actual antes de iniciar una nueva.');
    }

    // Validate units availability
    const availabilityResult = await validateUnitsAvailability(validInput.unit_ids);
    if (!availabilityResult.data && availabilityResult.error) {
      return failure(availabilityResult.error);
    }

    // Validate units belong to same organization
    const organizationResult = await validateUnitsSameOrganization(validInput.unit_ids);
    if (!organizationResult.data && organizationResult.error) {
      return failure(organizationResult.error);
    }

    const organizationId = organizationResult.data;

    // Get units with prices
    const { data: units, error: unitsError } = await client
      .from('units')
      .select('id, price')
      .in('id', validInput.unit_ids);

    if (unitsError) {
      throw new DatabaseError('Error al obtener precios de unidades', unitsError.code, unitsError);
    }

    const totalAmount = units.reduce((sum, unit) => sum + unit.price, 0);

    // Create operation
    const { data: operation, error: operationError } = await client
      .from('operations')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        status: 'initiated',
        total_amount: totalAmount,
        platform_fee: 3000, // Fixed platform fee
        currency: 'USD',
        notes: validInput.notes,
        created_by: userId
      })
      .select(`
        *,
        user:users(*),
        organization:organizations(*)
      `)
      .single();

    if (operationError) {
      throw new DatabaseError('Error al crear operación', operationError.code, operationError);
    }

    // Link units to operation
    const operationUnits = units.map(unit => ({
      operation_id: operation.id,
      unit_id: unit.id,
      price_at_reservation: unit.price
    }));

    const { error: unitsLinkError } = await client
      .from('operation_units')
      .insert(operationUnits);

    if (unitsLinkError) {
      throw new DatabaseError('Error al asociar unidades a la operación', unitsLinkError.code, unitsLinkError);
    }

    // Update units status to 'in_process'
    const { error: statusUpdateError } = await client
      .from('units')
      .update({ status: 'in_process' })
      .in('id', validInput.unit_ids);

    if (statusUpdateError) {
      throw new DatabaseError('Error al actualizar estado de unidades', statusUpdateError.code, statusUpdateError);
    }

    // Create operation steps
    const operationSteps = [
      {
        operation_id: operation.id,
        step_name: 'document_generation',
        step_order: 1,
        status: 'completed' as const
      },
      {
        operation_id: operation.id,
        step_name: 'document_upload',
        step_order: 2,
        status: 'pending' as const
      },
      {
        operation_id: operation.id,
        step_name: 'professional_validation',
        step_order: 3,
        status: 'pending' as const
      },
      {
        operation_id: operation.id,
        step_name: 'payment_confirmation',
        step_order: 4,
        status: 'pending' as const
      },
      {
        operation_id: operation.id,
        step_name: 'operation_completion',
        step_order: 5,
        status: 'pending' as const
      }
    ];

    const { error: stepsError } = await client
      .from('operation_steps')
      .insert(operationSteps);

    if (stepsError) {
      throw new DatabaseError('Error al crear pasos de operación', stepsError.code, stepsError);
    }

    // Log audit
    await logAudit(client, {
      userId,
      organizationId,
      tableName: 'operations',
      recordId: operation.id,
      action: 'INSERT',
      newValues: operation,
      ipAddress,
      userAgent
    });

    return success(operation);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
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
    const client = await getDbClient();

    let query = client
      .from('operations')
      .select(`
        *,
        user:users(*),
        organization:organizations(*),
        operation_units(
          *,
          unit:units(
            *,
            project:projects(*)
          )
        ),
        steps:operation_steps(*),
        professional_assignments(
          *,
          professional:professionals(
            *,
            user:users(*)
          )
        ),
        documents(*)
      `)
      .eq('id', operationId);

    // If userId provided, ensure user can access this operation
    if (userId) {
      // This will be enforced by RLS, but we can add explicit check here
      // For now, RLS handles the authorization
    }

    const { data: operation, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Operación', operationId);
      }
      throw new DatabaseError('Error al obtener operación', error.code, error);
    }

    return success(operation);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
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
    
    const client = await getDbClient();

    // Get current operation for audit
    const currentResult = await getOperationById(operationId, userId);
    if (!currentResult.data) {
      return failure(currentResult.error || 'Operación no encontrada');
    }

    const currentOperation = currentResult.data;

    // Validate status transition if status is being updated
    if (validInput.status) {
      const isValidTransition = validateStatusTransition(currentOperation.status, validInput.status);
      if (!isValidTransition) {
        throw new ValidationError(`Transición de estado inválida: ${currentOperation.status} → ${validInput.status}`);
      }
    }

    // Update operation
    const { data: updatedOperation, error } = await client
      .from('operations')
      .update(validInput)
      .eq('id', operationId)
      .select(`
        *,
        user:users(*),
        organization:organizations(*),
        operation_units(
          *,
          unit:units(
            *,
            project:projects(*)
          )
        ),
        steps:operation_steps(*),
        professional_assignments(
          *,
          professional:professionals(
            *,
            user:users(*)
          )
        ),
        documents(*)
      `)
      .single();

    if (error) {
      throw new DatabaseError('Error al actualizar operación', error.code, error);
    }

    // Handle status-specific actions
    if (validInput.status) {
      await handleStatusChange(client, operationId, validInput.status, userId);
    }

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: updatedOperation.organization_id,
      tableName: 'operations',
      recordId: operationId,
      action: 'UPDATE',
      oldValues: currentOperation,
      newValues: validInput,
      ipAddress,
      userAgent
    });

    return success(updatedOperation);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
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
    const client = await getDbClient();

    // Get current operation
    const currentResult = await getOperationById(operationId, userId);
    if (!currentResult.data) {
      return failure(currentResult.error || 'Operación no encontrada');
    }

    const currentOperation = currentResult.data;

    // Validate that operation can be cancelled
    if (['completed', 'cancelled'].includes(currentOperation.status)) {
      throw new ValidationError('No se puede cancelar una operación que ya está completada o cancelada');
    }

    // Update operation to cancelled
    const { data: cancelledOperation, error } = await client
      .from('operations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
        cancellation_reason: reason
      })
      .eq('id', operationId)
      .select(`
        *,
        user:users(*),
        organization:organizations(*)
      `)
      .single();

    if (error) {
      throw new DatabaseError('Error al cancelar operación', error.code, error);
    }

    // Release units back to available status
    const unitIds = currentOperation.operation_units?.map(ou => ou.unit_id) || [];
    if (unitIds.length > 0) {
      const { error: unitsError } = await client
        .from('units')
        .update({ status: 'available' })
        .in('id', unitIds);

      if (unitsError) {
        console.error('Error al liberar unidades:', unitsError);
        // Don't fail the cancellation if unit release fails
      }
    }

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: cancelledOperation.organization_id,
      tableName: 'operations',
      recordId: operationId,
      action: 'UPDATE',
      oldValues: currentOperation,
      newValues: { status: 'cancelled', cancellation_reason: reason },
      ipAddress,
      userAgent
    });

    return success(cancelledOperation);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}

/**
 * Get user's active operation
 */
export async function getUserActiveOperation(userId: string): Promise<Result<Operation | null>> {
  try {
    const client = await getDbClient();

    const { data: operations, error } = await client
      .from('operations')
      .select(`
        *,
        user:users(*),
        organization:organizations(*),
        operation_units(
          *,
          unit:units(
            *,
            project:projects(*)
          )
        ),
        steps:operation_steps(*),
        professional_assignments(
          *,
          professional:professionals(
            *,
            user:users(*)
          )
        ),
        documents(*)
      `)
      .eq('user_id', userId)
      .not('status', 'in', '("completed","cancelled")')
      .order('started_at', { ascending: false })
      .limit(1);

    if (error) {
      throw new DatabaseError('Error al obtener operación activa', error.code, error);
    }

    return success(operations.length > 0 ? operations[0] : null);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validate status transition
 */
function validateStatusTransition(from: OperationStatus, to: OperationStatus): boolean {
  const validTransitions: Record<OperationStatus, OperationStatus[]> = {
    'initiated': ['documents_pending', 'cancelled'],
    'documents_pending': ['documents_uploaded', 'cancelled'],
    'documents_uploaded': ['under_validation', 'documents_pending', 'cancelled'],
    'under_validation': ['professional_assigned', 'documents_uploaded', 'cancelled'],
    'professional_assigned': ['waiting_signature', 'under_validation', 'cancelled'],
    'waiting_signature': ['signature_completed', 'professional_assigned', 'cancelled'],
    'signature_completed': ['payment_pending', 'waiting_signature', 'cancelled'],
    'payment_pending': ['payment_confirmed', 'signature_completed', 'cancelled'],
    'payment_confirmed': ['completed'],
    'completed': [], // No transitions from completed
    'cancelled': [] // No transitions from cancelled
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
      const { data: operationUnits } = await client
        .from('operation_units')
        .select('unit_id')
        .eq('operation_id', operationId);

      if (operationUnits && operationUnits.length > 0) {
        const unitIds = operationUnits.map((ou: any) => ou.unit_id);
        await client
          .from('units')
          .update({ status: 'sold' })
          .in('id', unitIds);
      }
      break;

    case 'cancelled':
      // This is handled in the cancelOperation function
      break;

    case 'documents_uploaded':
      // Update the document_upload step
      await client
        .from('operation_steps')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('operation_id', operationId)
        .eq('step_name', 'document_upload');
      break;

    // Add more status-specific actions as needed
  }
}