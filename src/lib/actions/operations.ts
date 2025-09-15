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

interface StepComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

interface AddStepCommentInput {
  stepId: string;
  content: string;
  isInternal?: boolean;
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

/**
 * Update operation step status
 */
export async function updateOperationStepAction(
  operationId: string,
  stepId: string,
  newStatus: "pending" | "in_progress" | "completed",
): Promise<OperationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;

    // Check if user has permission to update operation steps
    const hasPermission = user.userRoles.some((role) =>
      ["admin", "organization_owner", "sales_manager", "site_manager", "finance", "professional"].includes(role.role),
    );

    if (!hasPermission) {
      return {
        success: false,
        error: "No tienes permisos para actualizar etapas de operaciones",
      };
    }

    const client = getDbClient();

    // First verify that the step belongs to the operation and user has access
    const operation = await client.operation.findUnique({
      where: { id: operationId },
      include: {
        steps: {
          where: { id: stepId }
        },
        operationUnits: {
          include: {
            unit: {
              include: {
                project: {
                  include: {
                    organization: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!operation) {
      return { success: false, error: "Operación no encontrada" };
    }

    if (operation.steps.length === 0) {
      return { success: false, error: "Etapa no encontrada" };
    }

    // Check if user has access to this operation's organization
    const userOrgIds = user.userRoles.map((role) => role.organizationId).filter(Boolean);
    const operationOrgId = operation.operationUnits[0]?.unit.project.organizationId;
    
    if (!user.userRoles.some(role => role.role === "admin") && !userOrgIds.includes(operationOrgId)) {
      return {
        success: false,
        error: "No tienes acceso a esta operación",
      };
    }

    const step = operation.steps[0];

    // Update the step
    const updatedStep = await client.operationStep.update({
      where: { id: stepId },
      data: {
        status: newStatus,
        startedAt: newStatus === "in_progress" && !step.startedAt ? new Date() : step.startedAt,
        completedAt: newStatus === "completed" ? new Date() : null,
      },
    });

    // If step is completed, check if we need to update operation status
    if (newStatus === "completed") {
      await updateOperationStatusBasedOnSteps(client, operationId);
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/operations/${operationId}`);
    revalidatePath("/userDashboard/shopping");

    return { success: true, data: serializeObject(updatedStep) };
  } catch (error) {
    console.error("[SERVER_ACTION] Error updating operation step:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error actualizando etapa de operación",
    };
  }
}

/**
 * Helper function to update operation status based on completed steps
 */
async function updateOperationStatusBasedOnSteps(client: any, operationId: string) {
  const operation = await client.operation.findUnique({
    where: { id: operationId },
    include: {
      steps: {
        orderBy: { stepOrder: "asc" },
      },
    },
  });

  if (!operation || !operation.steps) return;

  const completedSteps = operation.steps.filter((step: any) => step.status === "completed");
  const totalSteps = operation.steps.length;

  // Map step completion to operation status
  let newStatus = operation.status;

  if (completedSteps.length === 1) {
    newStatus = "documents_pending";
  } else if (completedSteps.length === 2) {
    newStatus = "documents_uploaded";
  } else if (completedSteps.length === 3) {
    newStatus = "under_validation";
  } else if (completedSteps.length === 4) {
    newStatus = "payment_pending";
  } else if (completedSteps.length === totalSteps) {
    newStatus = "completed";
  }

  // Update operation status if it changed
  if (newStatus !== operation.status) {
    await client.operation.update({
      where: { id: operationId },
      data: {
        status: newStatus,
        completedAt: newStatus === "completed" ? new Date() : null,
      },
    });
  }
}

// =============================================================================
// STEP COMMENTS FUNCTIONS
// =============================================================================

/**
 * Add a comment to a step using the metadata field
 */
export async function addStepCommentAction(
  input: AddStepCommentInput,
): Promise<OperationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;

    const client = getDbClient();

    // Get the step and verify access
    const step = await client.operationStep.findUnique({
      where: { id: input.stepId },
      include: {
        operation: {
          include: {
            operationUnits: {
              include: {
                unit: {
                  include: {
                    project: {
                      include: {
                        organization: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!step) {
      return { success: false, error: "Etapa no encontrada" };
    }

    // Check if user has access to this step's operation
    const userOrgIds = user.userRoles.map((role) => role.organizationId).filter(Boolean);
    const operationOrgId = step.operation.operationUnits[0]?.unit.project.organizationId;
    const isOwner = step.operation.userId === user.id;
    const isAdmin = user.userRoles.some(role => role.role === "admin");
    const hasOrgAccess = userOrgIds.includes(operationOrgId);
    
    // Allow comments if user is:
    // 1. Admin
    // 2. Owner of the operation
    // 3. Has organizational access with appropriate role
    const hasCommentPermission = isAdmin || 
                                isOwner || 
                                (hasOrgAccess && user.userRoles.some((role) =>
                                  ["organization_owner", "sales_manager", "site_manager", "finance", "professional"].includes(role.role)
                                ));
    
    if (!hasCommentPermission) {
      return {
        success: false,
        error: "No tienes permisos para agregar comentarios a esta operación",
      };
    }

    // Get current metadata
    const currentMetadata = step.metadata as any || {};
    const comments: StepComment[] = currentMetadata.comments || [];

    // Create new comment
    const newComment: StepComment = {
      id: crypto.randomUUID(),
      authorId: user.id,
      authorName: `${user.firstName} ${user.lastName}`,
      content: input.content,
      isInternal: input.isInternal || false,
      createdAt: new Date().toISOString(),
    };

    // Add comment to the array
    comments.push(newComment);

    // Update the step metadata
    const updatedStep = await client.operationStep.update({
      where: { id: input.stepId },
      data: {
        metadata: {
          ...currentMetadata,
          comments,
        },
      },
    });

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/operations/${step.operationId}`);
    revalidatePath("/userDashboard/shopping");

    return { success: true, data: serializeObject(newComment) };
  } catch (error) {
    console.error("[SERVER_ACTION] Error adding step comment:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error agregando comentario",
    };
  }
}

/**
 * Get comments for a step from metadata
 */
export async function getStepCommentsAction(
  stepId: string,
): Promise<OperationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const client = getDbClient();

    // Get the step and verify access
    const step = await client.operationStep.findUnique({
      where: { id: stepId },
      include: {
        operation: {
          include: {
            operationUnits: {
              include: {
                unit: {
                  include: {
                    project: {
                      include: {
                        organization: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!step) {
      return { success: false, error: "Etapa no encontrada" };
    }

    // Check if user has access to this step's operation
    const userOrgIds = user.userRoles.map((role) => role.organizationId).filter(Boolean);
    const operationOrgId = step.operation.operationUnits[0]?.unit.project.organizationId;
    const isOwner = step.operation.userId === user.id;
    
    if (!user.userRoles.some(role => role.role === "admin") && 
        !userOrgIds.includes(operationOrgId) && 
        !isOwner) {
      return {
        success: false,
        error: "No tienes acceso a esta etapa",
      };
    }

    // Get comments from metadata
    const metadata = step.metadata as any || {};
    const comments: StepComment[] = metadata.comments || [];

    // Filter internal comments for non-organization users
    const isOrgUser = userOrgIds.includes(operationOrgId) || user.userRoles.some(role => role.role === "admin");
    const filteredComments = isOrgUser 
      ? comments 
      : comments.filter(comment => !comment.isInternal);

    return { success: true, data: filteredComments };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting step comments:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo comentarios",
    };
  }
}

// Export wrappers for compatibility with existing imports
export const createOperation = createOperationAction;
export const cancelOperation = cancelOperationAction;
