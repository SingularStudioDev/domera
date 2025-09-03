// =============================================================================
// DOCUMENTS SERVER ACTIONS
// Server actions for document management - following single responsibility principle
// Only handles document-related operations
// =============================================================================

"use server";

import { revalidatePath } from "next/cache";

import type { DocumentStatus, DocumentType } from "@prisma/client";

import {
  requireOrganizationAccess,
  requireRole,
  validateSession,
} from "@/lib/auth/validation";
import {
  failure,
  getDbClient,
  logAudit,
  success,
  type Result,
} from "@/lib/dal/base";
import { getOperationById } from "@/lib/dal/operations";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface DocumentActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface CreateDocumentInput {
  operationId?: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}

interface DocumentTemplateInput {
  documentType: DocumentType;
  name: string;
  description?: string;
  templateContent?: string;
  fileUrl?: string;
}

// =============================================================================
// DOCUMENT TEMPLATES MANAGEMENT
// =============================================================================

/**
 * Get all document templates for an organization
 */
export async function getDocumentTemplatesAction(
  organizationId?: string,
): Promise<DocumentActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Validate organization access if organizationId provided
    if (organizationId) {
      const orgAccessResult = await requireOrganizationAccess(organizationId);
      if (!orgAccessResult.success) {
        return { success: false, error: orgAccessResult.error };
      }
    }

    const client = getDbClient();
    const templates = await client.documentTemplate.findMany({
      where: {
        OR: [
          { organizationId: organizationId },
          { organizationId: null }, // Global templates
        ],
      },
      include: {
        organization: {
          select: { name: true, slug: true },
        },
      },
      orderBy: [{ documentType: "asc" }, { version: "desc" }],
    });

    return {
      success: true,
      data: templates,
    };
  } catch (error) {
    console.error("[SERVER_ACTION] Error fetching document templates:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo plantillas de documentos",
    };
  }
}

/**
 * Create a new document template
 */
export async function createDocumentTemplateAction(
  input: DocumentTemplateInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<DocumentActionResult> {
  try {
    // Validate authentication and check role
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const hasPermission = user.userRoles.some((role) =>
      ["admin", "organization_owner"].includes(role.role),
    );

    if (!hasPermission) {
      return {
        success: false,
        error: "No tienes permisos para crear plantillas de documentos",
      };
    }

    // Get user's organization
    const userRole = user.userRoles.find((role) => role.organizationId);
    const organizationId = userRole?.organizationId || null;

    // Validate organization access if creating for organization
    if (organizationId) {
      const orgAccessResult = await requireOrganizationAccess(organizationId);
      if (!orgAccessResult.success) {
        return { success: false, error: orgAccessResult.error };
      }
    }

    const client = getDbClient();
    const template = await client.documentTemplate.create({
      data: {
        documentType: input.documentType,
        name: input.name,
        description: input.description,
        templateContent: input.templateContent,
        fileUrl: input.fileUrl,
        organizationId,
        createdBy: user.id,
      },
    });

    // Log audit
    await logAudit(client, {
      userId: user.id,
      organizationId,
      tableName: "document_templates",
      recordId: template.id,
      action: "INSERT",
      newValues: template,
      ipAddress,
      userAgent,
    });

    revalidatePath("/admin/templates");

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error("[SERVER_ACTION] Error creating document template:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error creando plantilla de documento",
    };
  }
}

// =============================================================================
// DOCUMENT MANAGEMENT FOR OPERATIONS
// =============================================================================

/**
 * Get required documents for an operation based on its current step
 */
export async function getRequiredDocumentsForOperationAction(
  operationId: string,
): Promise<DocumentActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const isAdmin = user.userRoles.some((role) => role.role === "admin");

    // Get operation using DAL (with user access validation if not admin)
    const operationResult = await getOperationById(
      operationId,
      isAdmin ? undefined : user.id,
    );
    if (!operationResult.data) {
      return {
        success: false,
        error: "Operación no encontrada",
      };
    }

    const operation = operationResult.data;

    // Define required documents based on operation status and steps
    const documentRequirements = getDocumentRequirementsByStatus(
      operation.status,
    );

    // Get existing documents for this operation
    const client = getDbClient();
    const existingDocs = await client.document.findMany({
      where: { operationId },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: {
        operation,
        requiredDocuments: documentRequirements,
        existingDocuments: existingDocs,
      },
    };
  } catch (error) {
    console.error("[SERVER_ACTION] Error fetching required documents:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo documentos requeridos",
    };
  }
}

/**
 * Define document requirements based on operation status
 */
function getDocumentRequirementsByStatus(status: string): Array<{
  type: DocumentType;
  required: boolean;
  description: string;
}> {
  const baseRequirements = [
    {
      type: "cedula_identidad" as DocumentType,
      required: true,
      description: "Cédula de Identidad del comprador",
    },
    {
      type: "certificado_ingresos" as DocumentType,
      required: true,
      description: "Certificado de ingresos o comprobantes de sueldo",
    },
  ];

  switch (status) {
    case "initiated":
    case "documents_pending":
      return baseRequirements;

    case "documents_uploaded":
    case "under_validation":
      return [
        ...baseRequirements,
        {
          type: "boleto_reserva" as DocumentType,
          required: true,
          description: "Boleto de reserva firmado",
        },
      ];

    case "professional_assigned":
    case "waiting_signature":
      return [
        ...baseRequirements,
        {
          type: "boleto_reserva" as DocumentType,
          required: true,
          description: "Boleto de reserva firmado",
        },
        {
          type: "compromiso_compraventa" as DocumentType,
          required: true,
          description: "Compromiso de compraventa",
        },
      ];

    case "payment_pending":
    case "payment_confirmed":
      return [
        ...baseRequirements,
        {
          type: "boleto_reserva" as DocumentType,
          required: true,
          description: "Boleto de reserva firmado",
        },
        {
          type: "compromiso_compraventa" as DocumentType,
          required: true,
          description: "Compromiso de compraventa firmado",
        },
        {
          type: "comprobante_pago" as DocumentType,
          required: true,
          description: "Comprobantes de pago",
        },
      ];

    default:
      return baseRequirements;
  }
}

/**
 * Upload a document for an operation
 */
export async function uploadDocumentAction(
  input: CreateDocumentInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<DocumentActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const client = getDbClient();

    // If operationId is provided, verify user owns the operation
    if (input.operationId) {
      const isAdmin = user.userRoles.some((role) => role.role === "admin");
      const operationResult = await getOperationById(
        input.operationId,
        isAdmin ? undefined : user.id,
      );

      if (!operationResult.data) {
        return {
          success: false,
          error: "Operación no encontrada o no autorizada",
        };
      }
    }

    // Get user's organization
    const userRole = user.userRoles.find((role) => role.organizationId);
    const organizationId = userRole?.organizationId || null;

    const document = await client.document.create({
      data: {
        operationId: input.operationId,
        userId: user.id,
        organizationId,
        documentType: input.documentType,
        title: input.title,
        description: input.description,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        status: "uploaded",
        uploadedBy: user.id,
      },
    });

    // Log audit
    await logAudit(client, {
      userId: user.id,
      organizationId,
      tableName: "documents",
      recordId: document.id,
      action: "INSERT",
      newValues: document,
      ipAddress,
      userAgent,
    });

    // Update operation status if this was the first document upload
    if (input.operationId) {
      const operation = await client.operation.findUnique({
        where: { id: input.operationId },
      });

      if (operation?.status === "initiated") {
        await client.operation.update({
          where: { id: input.operationId },
          data: { status: "documents_pending" },
        });
      }
    }

    revalidatePath("/operations");
    revalidatePath(`/operations/${input.operationId}`);

    return {
      success: true,
      data: document,
    };
  } catch (error) {
    console.error("[SERVER_ACTION] Error uploading document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error subiendo documento",
    };
  }
}

/**
 * Validate a document (for professionals and admins)
 */
export async function validateDocumentAction(
  documentId: string,
  status: DocumentStatus,
  notes?: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<DocumentActionResult> {
  try {
    // Validate authentication and check role
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const hasPermission = user.userRoles.some((role) =>
      ["admin", "organization_owner", "professional"].includes(role.role),
    );

    if (!hasPermission) {
      return {
        success: false,
        error: "No tienes permisos para validar documentos",
      };
    }

    const client = getDbClient();

    // Get current document for audit
    const currentDocument = await client.document.findUnique({
      where: { id: documentId },
    });

    if (!currentDocument) {
      return {
        success: false,
        error: "Documento no encontrado",
      };
    }

    const updatedDocument = await client.document.update({
      where: { id: documentId },
      data: {
        status,
        validatedBy: user.id,
        validatedAt: new Date(),
        validationNotes: notes,
      },
    });

    // Log audit
    await logAudit(client, {
      userId: user.id,
      organizationId: currentDocument.organizationId,
      tableName: "documents",
      recordId: documentId,
      action: "UPDATE",
      oldValues: { status: currentDocument.status },
      newValues: { status, validationNotes: notes },
      ipAddress,
      userAgent,
    });

    // Check if all required documents for the operation are validated
    if (updatedDocument.operationId && status === "validated") {
      await checkAndUpdateOperationDocumentStatus(updatedDocument.operationId);
    }

    revalidatePath("/operations");
    revalidatePath("/admin/documents");

    return {
      success: true,
      data: updatedDocument,
    };
  } catch (error) {
    console.error("[SERVER_ACTION] Error validating document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error validando documento",
    };
  }
}

/**
 * Check if all required documents are validated and update operation status
 */
async function checkAndUpdateOperationDocumentStatus(operationId: string) {
  try {
    const client = getDbClient();
    const operation = await client.operation.findUnique({
      where: { id: operationId },
      include: {
        documents: true,
      },
    });

    if (!operation) return;

    const requiredDocs = getDocumentRequirementsByStatus(operation.status);
    const requiredTypes = requiredDocs
      .filter((doc) => doc.required)
      .map((doc) => doc.type);

    // Check if all required document types are uploaded and validated
    const validatedTypes = operation.documents
      .filter((doc) => doc.status === "validated")
      .map((doc) => doc.documentType);

    const allRequiredValidated = requiredTypes.every((type) =>
      validatedTypes.includes(type),
    );

    // Update operation status if all documents are validated
    if (allRequiredValidated && operation.status === "documents_pending") {
      await client.operation.update({
        where: { id: operationId },
        data: { status: "under_validation" },
      });
    }
  } catch (error) {
    console.error("Error checking document validation status:", error);
  }
}

/**
 * Get all documents for current user
 */
export async function getUserDocumentsAction(): Promise<DocumentActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const client = getDbClient();

    const documents = await client.document.findMany({
      where: { userId: user.id },
      include: {
        operation: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error("[SERVER_ACTION] Error fetching user documents:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo documentos del usuario",
    };
  }
}
