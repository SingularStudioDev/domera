// =============================================================================
// DOCUMENTS SERVER ACTIONS FOR DOMERA PLATFORM
// Business logic for managing document types, templates, and uploads
// Created: August 2025
// =============================================================================

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { DocumentType, DocumentStatus } from '@prisma/client';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface DocumentResult {
  success: boolean;
  data?: any;
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
export async function getDocumentTemplates(organizationId?: string): Promise<DocumentResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const templates = await prisma.documentTemplate.findMany({
      where: {
        OR: [
          { organizationId: organizationId },
          { organizationId: null } // Global templates
        ]
      },
      include: {
        organization: {
          select: { name: true, slug: true }
        }
      },
      orderBy: [
        { documentType: 'asc' },
        { version: 'desc' }
      ]
    });

    return {
      success: true,
      data: templates
    };

  } catch (error) {
    console.error('Error fetching document templates:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

/**
 * Create a new document template
 */
export async function createDocumentTemplate(input: DocumentTemplateInput): Promise<DocumentResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Check if user has permission to create templates
    const hasPermission = session.user.roles.some(role => 
      ['admin', 'organization_owner'].includes(role.role)
    );

    if (!hasPermission) {
      return {
        success: false,
        error: 'No tienes permisos para crear templates de documentos'
      };
    }

    // Get user's organization
    const userRole = session.user.roles.find(role => role.organizationId);
    const organizationId = userRole?.organizationId || null;

    const template = await prisma.documentTemplate.create({
      data: {
        documentType: input.documentType,
        name: input.name,
        description: input.description,
        templateContent: input.templateContent,
        fileUrl: input.fileUrl,
        organizationId,
        createdBy: session.user.id
      }
    });

    revalidatePath('/admin/templates');

    return {
      success: true,
      data: template
    };

  } catch (error) {
    console.error('Error creating document template:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

// =============================================================================
// DOCUMENT MANAGEMENT FOR OPERATIONS
// =============================================================================

/**
 * Get required documents for an operation based on its current step
 */
export async function getRequiredDocumentsForOperation(operationId: string): Promise<DocumentResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Get operation with current step
    const operation = await prisma.operation.findFirst({
      where: {
        id: operationId,
        userId: session.user.id
      },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' }
        }
      }
    });

    if (!operation) {
      return {
        success: false,
        error: 'Operación no encontrada'
      };
    }

    // Define required documents based on operation status and steps
    const documentRequirements = getDocumentRequirementsByStatus(operation.status);

    // Get existing documents for this operation
    const existingDocs = await prisma.document.findMany({
      where: { operationId },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: {
        operation,
        requiredDocuments: documentRequirements,
        existingDocuments: existingDocs
      }
    };

  } catch (error) {
    console.error('Error fetching required documents:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
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
      type: 'cedula_identidad' as DocumentType,
      required: true,
      description: 'Cédula de Identidad del comprador'
    },
    {
      type: 'certificado_ingresos' as DocumentType,
      required: true,
      description: 'Certificado de ingresos o comprobantes de sueldo'
    }
  ];

  switch (status) {
    case 'initiated':
    case 'documents_pending':
      return baseRequirements;

    case 'documents_uploaded':
    case 'under_validation':
      return [
        ...baseRequirements,
        {
          type: 'boleto_reserva' as DocumentType,
          required: true,
          description: 'Boleto de reserva firmado'
        }
      ];

    case 'professional_assigned':
    case 'waiting_signature':
      return [
        ...baseRequirements,
        {
          type: 'boleto_reserva' as DocumentType,
          required: true,
          description: 'Boleto de reserva firmado'
        },
        {
          type: 'compromiso_compraventa' as DocumentType,
          required: true,
          description: 'Compromiso de compraventa'
        }
      ];

    case 'payment_pending':
    case 'payment_confirmed':
      return [
        ...baseRequirements,
        {
          type: 'boleto_reserva' as DocumentType,
          required: true,
          description: 'Boleto de reserva firmado'
        },
        {
          type: 'compromiso_compraventa' as DocumentType,
          required: true,
          description: 'Compromiso de compraventa firmado'
        },
        {
          type: 'comprobante_pago' as DocumentType,
          required: true,
          description: 'Comprobantes de pago'
        }
      ];

    default:
      return baseRequirements;
  }
}

/**
 * Upload a document for an operation
 */
export async function uploadDocument(input: CreateDocumentInput): Promise<DocumentResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // If operationId is provided, verify user owns the operation
    if (input.operationId) {
      const operation = await prisma.operation.findFirst({
        where: {
          id: input.operationId,
          userId: session.user.id
        }
      });

      if (!operation) {
        return {
          success: false,
          error: 'Operación no encontrada o no autorizada'
        };
      }
    }

    // Get user's organization
    const userRole = session.user.roles.find(role => role.organizationId);
    const organizationId = userRole?.organizationId || null;

    const document = await prisma.document.create({
      data: {
        operationId: input.operationId,
        userId: session.user.id,
        organizationId,
        documentType: input.documentType,
        title: input.title,
        description: input.description,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        status: 'uploaded',
        uploadedBy: session.user.id
      }
    });

    // Update operation status if this was the first document upload
    if (input.operationId) {
      const operation = await prisma.operation.findUnique({
        where: { id: input.operationId }
      });

      if (operation?.status === 'initiated') {
        await prisma.operation.update({
          where: { id: input.operationId },
          data: { status: 'documents_pending' }
        });
      }
    }

    revalidatePath('/operations');
    revalidatePath(`/operations/${input.operationId}`);

    return {
      success: true,
      data: document
    };

  } catch (error) {
    console.error('Error uploading document:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

/**
 * Validate a document (for professionals and admins)
 */
export async function validateDocument(
  documentId: string, 
  status: DocumentStatus, 
  notes?: string
): Promise<DocumentResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Check if user has permission to validate documents
    const hasPermission = session.user.roles.some(role => 
      ['admin', 'organization_owner', 'professional'].includes(role.role)
    );

    if (!hasPermission) {
      return {
        success: false,
        error: 'No tienes permisos para validar documentos'
      };
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status,
        validatedBy: session.user.id,
        validatedAt: new Date(),
        validationNotes: notes
      }
    });

    // Check if all required documents for the operation are validated
    if (updatedDocument.operationId && status === 'validated') {
      await checkAndUpdateOperationDocumentStatus(updatedDocument.operationId);
    }

    revalidatePath('/operations');
    revalidatePath('/admin/documents');

    return {
      success: true,
      data: updatedDocument
    };

  } catch (error) {
    console.error('Error validating document:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

/**
 * Check if all required documents are validated and update operation status
 */
async function checkAndUpdateOperationDocumentStatus(operationId: string) {
  try {
    const operation = await prisma.operation.findUnique({
      where: { id: operationId },
      include: {
        documents: true
      }
    });

    if (!operation) return;

    const requiredDocs = getDocumentRequirementsByStatus(operation.status);
    const requiredTypes = requiredDocs.filter(doc => doc.required).map(doc => doc.type);

    // Check if all required document types are uploaded and validated
    const validatedTypes = operation.documents
      .filter(doc => doc.status === 'validated')
      .map(doc => doc.documentType);

    const allRequiredValidated = requiredTypes.every(type => 
      validatedTypes.includes(type)
    );

    // Update operation status if all documents are validated
    if (allRequiredValidated && operation.status === 'documents_pending') {
      await prisma.operation.update({
        where: { id: operationId },
        data: { status: 'under_validation' }
      });
    }

  } catch (error) {
    console.error('Error checking document validation status:', error);
  }
}

/**
 * Get all documents for current user
 */
export async function getUserDocuments(): Promise<DocumentResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      include: {
        operation: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: documents
    };

  } catch (error) {
    console.error('Error fetching user documents:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}