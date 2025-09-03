// =============================================================================
// DOCUMENTS HOOK
// Client-side hook to manage operation documents
// =============================================================================

"use client";

import { useEffect, useState } from "react";

import { DocumentType } from "@prisma/client";
import { useSession } from "next-auth/react";

import {
  getRequiredDocumentsForOperation,
  getUserDocuments,
  uploadDocument,
} from "@/lib/actions/documents";

export interface DocumentData {
  id: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  status: string;
  createdAt: Date;
  operation?: {
    id: string;
    status: string;
  };
}

export interface RequiredDocument {
  type: DocumentType;
  required: boolean;
  description: string;
}

export function useDocuments(operationId?: string) {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<
    RequiredDocument[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch user documents and requirements
  useEffect(() => {
    async function fetchDocuments() {
      if (!session?.user) return;

      try {
        setLoading(true);
        setError(null);

        if (operationId) {
          // Get required documents for specific operation
          const result = await getRequiredDocumentsForOperation(operationId);
          if (result.success) {
            setRequiredDocuments(result.data.requiredDocuments);
            setDocuments(result.data.existingDocuments);
          } else {
            setError(result.error || "Error al cargar documentos");
          }
        } else {
          // Get all user documents
          const result = await getUserDocuments();
          if (result.success) {
            setDocuments(result.data);
          } else {
            setError(result.error || "Error al cargar documentos");
          }
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Error interno del servidor");
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [session, operationId]);

  // Upload document function
  const handleUploadDocument = async (
    file: File,
    documentType: DocumentType,
    title: string,
    description?: string,
  ) => {
    if (!session?.user) {
      setError("Usuario no autenticado");
      return false;
    }

    try {
      setUploading(true);
      setError(null);

      // TODO: Frontend developers should implement file upload to storage service
      // For now, we'll simulate with a placeholder URL
      const fileUrl = `https://storage.domera.uy/documents/${Date.now()}-${file.name}`;

      const result = await uploadDocument({
        operationId,
        documentType,
        title,
        description,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      if (result.success) {
        // Refresh documents list
        if (operationId) {
          const refreshResult =
            await getRequiredDocumentsForOperation(operationId);
          if (refreshResult.success) {
            setDocuments(refreshResult.data.existingDocuments);
          }
        } else {
          const refreshResult = await getUserDocuments();
          if (refreshResult.success) {
            setDocuments(refreshResult.data);
          }
        }
        return true;
      } else {
        setError(result.error || "Error al subir documento");
        return false;
      }
    } catch (err) {
      console.error("Error uploading document:", err);
      setError("Error interno del servidor");
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Check if document type is uploaded and validated
  const isDocumentCompleted = (documentType: DocumentType) => {
    return documents.some(
      (doc) => doc.documentType === documentType && doc.status === "validated",
    );
  };

  // Check if document type is uploaded but pending validation
  const isDocumentPending = (documentType: DocumentType) => {
    return documents.some(
      (doc) =>
        doc.documentType === documentType &&
        ["uploaded", "under_review"].includes(doc.status),
    );
  };

  // Get completion progress percentage
  const getCompletionProgress = () => {
    if (requiredDocuments.length === 0) return 0;

    const completedCount = requiredDocuments.filter((reqDoc) =>
      isDocumentCompleted(reqDoc.type),
    ).length;

    return Math.round((completedCount / requiredDocuments.length) * 100);
  };

  return {
    documents,
    requiredDocuments,
    loading,
    error,
    uploading,
    handleUploadDocument,
    isDocumentCompleted,
    isDocumentPending,
    getCompletionProgress,
  };
}
