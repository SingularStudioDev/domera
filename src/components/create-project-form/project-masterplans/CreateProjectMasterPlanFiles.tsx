"use client";

import React, { useCallback, useRef, useState } from "react";

import { cn } from "@/utils/utils";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";

import type { MasterPlanFile } from "@/types/project-form";
import { uploadProjectDocuments } from "@/lib/actions/storage";
import { validateDocumentFiles } from "@/lib/utils/images";

// =============================================================================
// TYPES
// =============================================================================

interface DocumentFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: "pending" | "uploading" | "uploaded" | "error";
  uploadedUrl?: string;
  uploadedPath?: string;
  error?: string;
}

interface CreateProjectMasterPlanFilesProps {
  value: MasterPlanFile[];
  onChange: (files: MasterPlanFile[]) => void;
  maxFiles?: number;
  projectId?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CreateProjectMasterPlanFiles({
  value = [],
  onChange,
  maxFiles = 10,
  projectId,
  placeholder = "Agregar archivos de Master Plan",
  className,
  disabled = false,
}: CreateProjectMasterPlanFilesProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const canAddMore = documents.length + value.length < maxFiles;

  const formatFileSize = (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // =============================================================================
  // FILE HANDLING
  // =============================================================================

  const handleFileSelect = useCallback(
    (files: FileList | File[]) => {
      if (disabled || isUploading) return;

      const fileArray = Array.from(files);
      const { valid, invalid } = validateDocumentFiles(fileArray);

      // Show validation errors
      if (invalid.length > 0) {
        const errors = invalid.map(
          (item) => `${item.file.name}: ${item.reason}`,
        );
        setUploadError(`Archivos inválidos:\n${errors.join("\n")}`);
        return;
      }

      // Check total limit
      const totalFiles = documents.length + value.length + valid.length;
      if (totalFiles > maxFiles) {
        setUploadError(`Se excede el límite de ${maxFiles} archivos`);
        return;
      }

      // Create document file function moved inside callback
      const createDocumentFile = (file: File): DocumentFile => ({
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        status: "pending",
      });

      // Add new documents to pending list
      const newDocuments = valid.map(createDocumentFile);
      setDocuments((prev) => [...prev, ...newDocuments]);
      setUploadError(null);
    },
    [disabled, isUploading, documents.length, value.length, maxFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelect(files);
      }
    },
    [disabled, isUploading, handleFileSelect],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isUploading) {
        setDragActive(true);
      }
    },
    [disabled, isUploading],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files);
      }
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileSelect],
  );

  // =============================================================================
  // DOCUMENT MANAGEMENT
  // =============================================================================

  const removeDocument = useCallback(
    (documentId: string) => {
      if (disabled || isUploading) return;

      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    },
    [disabled, isUploading],
  );

  const removeUploadedDocument = useCallback(
    (index: number) => {
      if (disabled || isUploading) return;

      const newFiles = [...value];
      newFiles.splice(index, 1);
      onChange(newFiles);
    },
    [disabled, isUploading, value, onChange],
  );

  // =============================================================================
  // BATCH UPLOAD
  // =============================================================================

  const handleBatchUpload = useCallback(async () => {
    if (documents.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    // Update all documents to uploading status
    setDocuments((prev) =>
      prev.map((doc) => ({ ...doc, status: "uploading" as const })),
    );

    try {
      // Create FormData with documents
      const formData = new FormData();
      documents.forEach((doc, index) => {
        formData.append(`document-${index}`, doc.file);
      });

      // Upload documents via server action
      const result = await uploadProjectDocuments(formData, projectId);

      if (result.success && result.documents) {
        // Convert uploaded documents to MasterPlanFile format
        const newFiles: MasterPlanFile[] = result.documents.map((doc) => ({
          id: doc.id,
          name: doc.name,
          url: doc.url,
          path: doc.path,
        }));

        onChange([...value, ...newFiles]);

        // Update document states to uploaded
        setDocuments((prev) =>
          prev.map((doc, index) => ({
            ...doc,
            status: "uploaded" as const,
            uploadedUrl: result.documents![index]?.url,
            uploadedPath: result.documents![index]?.path,
          })),
        );

        // Clear uploaded documents after a short delay
        setTimeout(() => {
          setDocuments([]);
        }, 1000);
      } else {
        // Handle upload errors
        setUploadError(result.error || "Error desconocido en la subida");

        // Update document states to error
        setDocuments((prev) =>
          prev.map((doc) => ({
            ...doc,
            status: "error" as const,
            error: result.error,
          })),
        );

        // If there were specific file failures
        if (result.failedUploads) {
          const failureMap = new Map(
            result.failedUploads.map((f) => [f.fileName, f.error]),
          );
          setDocuments((prev) =>
            prev.map((doc) => ({
              ...doc,
              status: "error" as const,
              error: failureMap.get(doc.file.name) || "Error desconocido",
            })),
          );
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Error interno del servidor",
      );

      // Update all documents to error status
      setDocuments((prev) =>
        prev.map((doc) => ({
          ...doc,
          status: "error" as const,
          error: "Error de conexión",
        })),
      );
    } finally {
      setIsUploading(false);
    }
  }, [documents, isUploading, value, onChange, projectId]);

  // =============================================================================
  // RENDER STATUS ICON
  // =============================================================================

  const renderStatusIcon = (status: DocumentFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "uploaded":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Already uploaded documents */}
      {value.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Archivos subidos ({value.length})
          </h4>
          <div className="space-y-2">
            {value.map((file, index) => (
              <div
                key={`uploaded-${index}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50"
              >
                <FileText className="h-5 w-5 text-green-500" />

                <div className="flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  {file.size && (
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded p-1 text-blue-500 hover:bg-blue-50"
                    title="Descargar archivo"
                  >
                    <Download className="h-4 w-4" />
                  </a>

                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeUploadedDocument(index)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                      title="Eliminar archivo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending documents */}
      {documents.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Archivos pendientes ({documents.length})
            </h4>
            {documents.length > 0 && !isUploading && (
              <button
                type="button"
                onClick={handleBatchUpload}
                disabled={disabled}
                className="bg-primaryColor hover:bg-primaryColor/90 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
              >
                <Upload className="mr-2 inline h-4 w-4" />
                Subir {documents.length} archivo
                {documents.length > 1 ? "s" : ""}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  doc.status === "error" && "border-red-200 bg-red-50",
                  doc.status === "uploaded" && "border-green-200 bg-green-50",
                  doc.status === "uploading" && "border-blue-200 bg-blue-50",
                  doc.status === "pending" && "border-gray-200 bg-gray-50",
                )}
              >
                {renderStatusIcon(doc.status)}

                <div className="flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(doc.size)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status indicator */}
                  <div
                    className={cn(
                      "rounded px-2 py-1 text-xs font-medium",
                      doc.status === "pending" && "bg-gray-500 text-white",
                      doc.status === "uploading" && "bg-blue-500 text-white",
                      doc.status === "uploaded" && "bg-green-500 text-white",
                      doc.status === "error" && "bg-red-500 text-white",
                    )}
                  >
                    {doc.status === "pending" && "Pendiente"}
                    {doc.status === "uploading" && "Subiendo..."}
                    {doc.status === "uploaded" && "Subido"}
                    {doc.status === "error" && "Error"}
                  </div>

                  {!disabled && doc.status !== "uploading" && (
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="rounded p-1 text-red-500 hover:bg-red-100"
                      title="Eliminar archivo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Error message */}
                {doc.status === "error" && doc.error && (
                  <div className="absolute mt-8 max-w-xs rounded bg-red-500 p-2 text-xs text-white">
                    {doc.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload area */}
      {canAddMore && !isUploading && (
        <div
          className={cn(
            "relative w-full cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors",
            dragActive && !disabled && "border-primaryColor bg-primaryColor/5",
            !dragActive && "border-gray-300 hover:border-gray-400",
            disabled && "cursor-not-allowed opacity-50",
            uploadError && "border-red-300",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center text-gray-500">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              {value.length === 0 && documents.length === 0 ? (
                <FileText className="h-8 w-8 text-gray-400" />
              ) : (
                <Plus className="h-8 w-8 text-gray-400" />
              )}
            </div>

            <p className="mb-2 text-lg font-medium">
              {value.length === 0 && documents.length === 0
                ? placeholder
                : "Agregar más archivos"}
            </p>

            <p className="mb-4 text-center text-sm">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>

            <div className="text-center text-xs text-gray-400">
              <p>PDF, Word, Excel, imágenes. Máximo 20MB por archivo</p>
              <p>
                {value.length + documents.length} / {maxFiles} archivos
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpeg,.jpg,.png,.webp"
            onChange={handleInputChange}
            disabled={disabled}
            multiple
            className="hidden"
          />
        </div>
      )}

      {/* Limit reached message */}
      {!canAddMore && (
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">
            Límite de {maxFiles} archivos alcanzado
          </p>
        </div>
      )}

      {/* Global upload progress */}
      {isUploading && (
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">
              Subiendo {documents.length} archivo
              {documents.length > 1 ? "s" : ""}...
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">Error en la subida</p>
          </div>
          <p className="mt-1 text-sm whitespace-pre-line text-red-600">
            {uploadError}
          </p>
        </div>
      )}
    </div>
  );
}
