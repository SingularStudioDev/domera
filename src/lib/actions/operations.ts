// =============================================================================
// OPERATIONS SERVER ACTIONS
// Server actions for operation management - following single responsibility principle
// Only handles operation-related operations
// =============================================================================

"use server";

import { revalidatePath } from "next/cache";

import type { OperationStatus } from "@prisma/client";

import {
  requireOrganizationAccess,
  requireRole,
  validateSession,
} from "@/lib/auth/validation";
import {
  cancelOperation as cancelOperationDAL,
  getOperationById,
  getUserActiveOperation,
  hasActiveOperation,
  updateOperation,
} from "@/lib/dal/operations";
import {
  createOperationWithValidation,
  validateUnitsSameOrganization,
} from "@/lib/services/operations";
import { serializeOperation, serializeObject } from "@/lib/utils/serialization";
import { getDbClient } from "@/lib/dal/base";

// Input types
interface CreateOperationInput {
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
// TYPES AND INTERFACES
// =============================================================================

interface OperationActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// =============================================================================
// SERVER ACTIONS FOR OPERATIONS
// =============================================================================

/**
 * Create new operation
 * Requires user authentication and units validation
 */
export async function createOperationAction(
  input: CreateOperationInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<OperationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;

    // Check if user already has an active operation
    const hasActiveResult = await hasActiveOperation(user.id);
    if (!hasActiveResult.data && hasActiveResult.error) {
      return { success: false, error: hasActiveResult.error };
    }
    if (hasActiveResult.data) {
      return {
        success: false,
        error:
          "Ya tienes una operación activa. Solo puedes tener una operación a la vez.",
      };
    }

    // Validate organization access
    const orgAccessResult = await requireOrganizationAccess(
      input.organizationId,
    );
    if (!orgAccessResult.success) {
      return { success: false, error: orgAccessResult.error };
    }

    // Use service layer to create operation with full validation
    const result = await createOperationWithValidation(
      user.id,
      input,
      ipAddress,
      userAgent,
    );

    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/userDashboard");
    revalidatePath("/userDashboard/shopping");
    revalidatePath("/projects");

    return { success: true, data: serializeObject(result.data) };
  } catch (error) {
    console.error("[SERVER_ACTION] Error creating operation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error creando operación",
    };
  }
}

/**
 * Get operation by ID
 * Requires authentication and operation access
 */
export async function getOperationByIdAction(
  operationId: string,
): Promise<OperationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const isAdmin = user.userRoles.some((role) => role.role === "admin");

    // Get operation (with user access validation if not admin)
    const result = await getOperationById(
      operationId,
      isAdmin ? undefined : user.id,
    );
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Serialize the operation data to handle Decimal fields
    const serializedOperation = serializeObject(result.data);

    return { success: true, data: serializedOperation };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting operation:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error obteniendo operación",
    };
  }
}

/**
 * Update operation
 * Requires authentication and operation ownership or admin role
 */
export async function updateOperationAction(
  operationId: string,
  input: UpdateOperationInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<OperationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const isAdmin = user.userRoles.some((role) => role.role === "admin");

    // Check if user can access this operation
    const operationResult = await getOperationById(
      operationId,
      isAdmin ? undefined : user.id,
    );
    if (!operationResult.data) {
      return { success: false, error: operationResult.error };
    }

    const operation = operationResult.data;

    // Validate access: user owns operation, is admin, or has organization access
    const canUpdate =
      operation.userId === user.id ||
      isAdmin ||
      user.userRoles.some(
        (role) =>
          role.organizationId === operation.organizationId &&
          ["organization_owner", "sales_manager"].includes(role.role),
      );

    if (!canUpdate) {
      return {
        success: false,
        error: "No tienes permisos para actualizar esta operación",
      };
    }

    // Update operation
    const result = await updateOperation(
      operationId,
      user.id,
      input,
      ipAddress,
      userAgent,
    );
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/userDashboard");
    revalidatePath(`/operations/${operationId}`);

    return { success: true, data: serializeObject(result.data) };
  } catch (error) {
    console.error("[SERVER_ACTION] Error updating operation:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error actualizando operación",
    };
  }
}

/**
 * Cancel operation
 * Requires authentication and operation ownership or admin role
 */
export async function cancelOperationAction(
  operationId: string,
  reason: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<OperationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const isAdmin = user.userRoles.some((role) => role.role === "admin");

    // Check if user can access this operation
    const operationResult = await getOperationById(
      operationId,
      isAdmin ? undefined : user.id,
    );
    if (!operationResult.data) {
      return { success: false, error: operationResult.error };
    }

    const operation = operationResult.data;

    // Validate access: user owns operation, is admin, or has organization access
    const canCancel =
      operation.userId === user.id ||
      isAdmin ||
      user.userRoles.some(
        (role) =>
          role.organizationId === operation.organizationId &&
          ["organization_owner", "sales_manager"].includes(role.role),
      );

    if (!canCancel) {
      return {
        success: false,
        error: "No tienes permisos para cancelar esta operación",
      };
    }

    // Cancel operation
    const result = await cancelOperationDAL(
      operationId,
      user.id,
      reason,
      ipAddress,
      userAgent,
    );
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // NOTE: Service layer should handle unit status updates when operation is cancelled
    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/userDashboard");
    revalidatePath("/userDashboard/shopping");
    revalidatePath("/projects");
    revalidatePath(`/operations/${operationId}`);

    return { success: true, data: serializeObject(result.data) };
  } catch (error) {
    console.error("[SERVER_ACTION] Error cancelling operation:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error cancelando operación",
    };
  }
}

/**
 * Get user's active operation
 * Requires authentication
 */
export async function getUserActiveOperationAction(): Promise<OperationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;

    // Get active operation
    const result = await getUserActiveOperation(user.id);
    if (!result.data && result.error) {
      return { success: false, error: result.error };
    }

    // Serialize the operation data to handle Decimal fields
    const serializedOperation = result.data ? serializeObject(result.data) : null;

    return { success: true, data: serializedOperation };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting active operation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo operación activa",
    };
  }
}

/**
 * Check if user has active operation
 * Requires authentication
 */
export async function hasActiveOperationAction(): Promise<OperationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;

    // Check for active operation
    const result = await hasActiveOperation(user.id);
    return {
      success: result.data || false,
      data: result.data,
      error: result.error,
    };
  } catch (error) {
    console.error("[SERVER_ACTION] Error checking active operation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error verificando operación activa",
    };
  }
}

// =============================================================================
// VALIDATION ACTIONS
// =============================================================================

/**
 * Validate units belong to same organization
 * Used before creating operations
 */
export async function validateUnitsSameOrganizationAction(
  unitIds: string[],
): Promise<OperationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Use service layer validation
    const result = await validateUnitsSameOrganization(unitIds);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: serializeObject(result.data) };
  } catch (error) {
    console.error(
      "[SERVER_ACTION] Error validating units organization:",
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error validando organización de unidades",
    };
  }
}

/**
 * Create new operation (simplified) ONLY FOR TEST - DONT USE'IT IN PROD
 * Only requires unitIds, calculates organizationId and totalAmount internally
 */
export async function createOperationSimpleAction(
  input: { unitIds: string[]; notes?: string },
  ipAddress?: string,
  userAgent?: string,
): Promise<OperationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;

    // Use service layer to create operation with full validation
    const result = await createOperationWithValidation(
      user.id,
      input,
      ipAddress,
      userAgent,
    );

    if (!result.data) {
      return {
        success: false,
        error: result.error || "Error creando operación",
      };
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/userDashboard");
    revalidatePath("/userDashboard/shopping");
    revalidatePath("/projects");

    return { success: true, data: serializeObject(result.data) };
  } catch (error) {
    console.error("[SERVER_ACTION] Error creating operation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error creando operación",
    };
  }
}

/**
 * Get operations by project for dashboard view
 */
export async function getOperationsByProjectAction(
  projectId: string,
): Promise<OperationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;

    // Check if user has access to this project (admin, organization_owner, sales_manager, etc.)
    const hasPermission = user.userRoles.some((role) =>
      ["admin", "organization_owner", "sales_manager", "site_manager", "finance"].includes(role.role),
    );

    if (!hasPermission) {
      return {
        success: false,
        error: "No tienes permisos para ver las operaciones de este proyecto",
      };
    }

    const client = getDbClient();

    // Get operations for the project
    const operations = await client.operation.findMany({
      where: {
        operationUnits: {
          some: {
            unit: {
              projectId: projectId,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        operationUnits: {
          include: {
            unit: {
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        steps: {
          orderBy: {
            stepOrder: "asc",
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    // Serialize the operations data to handle Decimal fields
    const serializedOperations = operations.map((operation) =>
      serializeObject(operation),
    );

    return { success: true, data: serializedOperations };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting operations by project:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo operaciones del proyecto",
    };
  }
}

// Export wrappers for compatibility with existing imports
export const createOperation = createOperationAction;
export const cancelOperation = cancelOperationAction;
