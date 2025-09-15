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
import { serializeObject } from "@/lib/utils/serialization";

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
      data: serializeObject(templates),
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
      data: serializeObject(template),
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
 * Get required documents for a specific step
 */
export async function getRequiredDocumentsForStepAction(
  operationId: string,
  stepId: string,
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

    // Find the specific step
    const targetStep = operation.steps.find(step => step.id === stepId);
    if (!targetStep) {
      return {
        success: false,
        error: "Etapa no encontrada",
      };
    }

    // Get document requirements for this specific step
    const documentRequirements = getDocumentRequirementsByStep(targetStep.stepName);

    // Get existing documents for this operation and step
    const client = getDbClient();
    const existingDocs = await client.document.findMany({
      where: { 
        operationId,
        // Optionally filter by step in the future
      },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: {
        operation: serializeObject(operation),
        step: serializeObject(targetStep),
        requiredDocuments: documentRequirements,
        existingDocuments: serializeObject(existingDocs),
      },
    };
  } catch (error) {
    console.error("[SERVER_ACTION] Error fetching required documents for step:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo documentos requeridos para la etapa",
    };
  }
}

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
        operation: serializeObject(operation),
        requiredDocuments: documentRequirements,
        existingDocuments: serializeObject(existingDocs),
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
 * Define document requirements based on specific step
 */
function getDocumentRequirementsByStep(stepName: string): Array<{
  type: DocumentType;
  required: boolean;
  description: string;
  initialUploader: "developer" | "user";
  allowsIterations: boolean;
}> {
  switch (stepName) {
    case "document_generation":
      // Step 1: Desarrolladora genera documentos iniciales
      return [
        {
          type: "boleto_reserva" as DocumentType,
          required: true,
          description: "Boleto de reserva inicial",
          initialUploader: "developer" as const,
          allowsIterations: true,
        },
      ];

    case "document_upload":
      // Step 2: Flujo iterativo de documentos entre usuario y desarrolladora
      return [
        {
          type: "boleto_reserva" as DocumentType,
          required: true,
          description: "Boleto de reserva firmado",
          initialUploader: "developer" as const,
          allowsIterations: true,
        },
        {
          type: "cedula_identidad" as DocumentType,
          required: true,
          description: "Cédula de Identidad del comprador",
          initialUploader: "user" as const,
          allowsIterations: false,
        },
        {
          type: "certificado_ingresos" as DocumentType,
          required: true,
          description: "Certificado de ingresos o comprobantes de sueldo",
          initialUploader: "user" as const,
          allowsIterations: false,
        },
      ];

    case "professional_validation":
      // Step 3: Documentos para validación profesional
      return [
        {
          type: "compromiso_compraventa" as DocumentType,
          required: true,
          description: "Compromiso de compraventa",
          initialUploader: "developer" as const,
          allowsIterations: true,
        },
      ];

    case "payment_confirmation":
      // Step 4: Documentos de pago
      return [
        {
          type: "comprobante_pago" as DocumentType,
          required: true,
          description: "Comprobantes de pago",
          initialUploader: "user" as const,
          allowsIterations: false,
        },
      ];

    case "operation_completion":
      // Step 5: Documentos finales
      return [
        {
          type: "escritura" as DocumentType,
          required: true,
          description: "Escritura final",
          initialUploader: "developer" as const,
          allowsIterations: false,
        },
      ];

    default:
      return [];
  }
}

/**
 * Define document requirements based on operation status (LEGACY - kept for compatibility)
 */
function getDocumentRequirementsByStatus(status: string): Array<{
  type: DocumentType;
  required: boolean;
  description: string;
  initialUploader: "developer" | "user";
  allowsIterations: boolean;
}> {
  const baseRequirements = [
    {
      type: "cedula_identidad" as DocumentType,
      required: true,
      description: "Cédula de Identidad del comprador",
      initialUploader: "user" as const,
      allowsIterations: false,
    },
    {
      type: "certificado_ingresos" as DocumentType,
      required: true,
      description: "Certificado de ingresos o comprobantes de sueldo",
      initialUploader: "user" as const,
      allowsIterations: false,
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
          initialUploader: "developer" as const,
          allowsIterations: true,
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
          initialUploader: "developer" as const,
          allowsIterations: true,
        },
        {
          type: "compromiso_compraventa" as DocumentType,
          required: true,
          description: "Compromiso de compraventa",
          initialUploader: "developer" as const,
          allowsIterations: true,
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
          initialUploader: "developer" as const,
          allowsIterations: true,
        },
        {
          type: "compromiso_compraventa" as DocumentType,
          required: true,
          description: "Compromiso de compraventa firmado",
          initialUploader: "developer" as const,
          allowsIterations: true,
        },
        {
          type: "comprobante_pago" as DocumentType,
          required: true,
          description: "Comprobantes de pago",
          initialUploader: "user" as const,
          allowsIterations: false,
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
    const organizationId = userRole?.organizationId || undefined;

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
      data: serializeObject(document),
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
      data: serializeObject(updatedDocument),
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
      data: serializeObject(documents),
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

/**
 * Get document versions for a specific document type in an operation
 */
export async function getDocumentVersionsAction(
  operationId: string,
  documentType: DocumentType,
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
        error: "Operación no encontrada o no autorizada",
      };
    }

    const client = getDbClient();
    const documentVersions = await client.document.findMany({
      where: { 
        operationId,
        documentType 
      },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: serializeObject(documentVersions),
    };
  } catch (error) {
    console.error("[SERVER_ACTION] Error fetching document versions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo versiones del documento",
    };
  }
}

/**
 * Get all documents for a specific operation
 */
export async function getOperationDocumentsAction(
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
        error: "Operación no encontrada o no autorizada",
      };
    }

    const client = getDbClient();
    const documents = await client.document.findMany({
      where: { operationId },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: serializeObject(documents),
    };
  } catch (error) {
    console.error("[SERVER_ACTION] Error fetching operation documents:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo documentos de la operación",
    };
  }
}
