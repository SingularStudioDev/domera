"use client";

import React, { useCallback, useRef, useState } from "react";

import { cn } from "@/utils/utils";
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";

import { uploadProjectImages } from "@/lib/actions/storage";

// =============================================================================
// TYPES
// =============================================================================

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "uploaded" | "error";
  uploadedUrl?: string;
  uploadedPath?: string;
  error?: string;
}

interface BatchImageUploadProps {
  value: string[]; // URLs of uploaded images
  onChange: (urls: string[]) => void;
  onPathsChange?: (paths: string[]) => void; // For tracking storage paths
  maxImages?: number;
  projectId?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  aspectRatio?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const BatchImageUpload: React.FC<BatchImageUploadProps> = ({
  value = [],
  onChange,
  onPathsChange,
  maxImages = 20,
  projectId,
  placeholder = "Agregar imágenes del proyecto",
  className,
  disabled = false,
  aspectRatio = "aspect-video",
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const createImageFile = (file: File): ImageFile => ({
    id: generateId(),
    file,
    preview: URL.createObjectURL(file),
    status: "pending",
  });

  const canAddMore = images.length + value.length < maxImages;

  // =============================================================================
  // FILE HANDLING
  // =============================================================================

  const handleFileSelect = useCallback(
    (files: FileList | File[]) => {
      if (disabled || isUploading) return;

      const fileArray = Array.from(files);
      const { valid, invalid } = validateImageFiles(fileArray);

      // Show validation errors
      if (invalid.length > 0) {
        const errors = invalid.map(
          (item) => `${item.file.name}: ${item.reason}`,
        );
        setUploadError(`Archivos inválidos:\n${errors.join("\n")}`);
        return;
      }

      // Check total limit
      const totalImages = images.length + value.length + valid.length;
      if (totalImages > maxImages) {
        setUploadError(`Se excede el límite de ${maxImages} imágenes`);
        return;
      }

      // Add new images to pending list
      const newImages = valid.map(createImageFile);
      setImages((prev) => [...prev, ...newImages]);
      setUploadError(null);
    },
    [disabled, isUploading, images.length, value.length, maxImages],
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
  // IMAGE MANAGEMENT
  // =============================================================================

  const removeImage = useCallback(
    (imageId: string) => {
      if (disabled || isUploading) return;

      setImages((prev) => {
        const updatedImages = prev.filter((img) => img.id !== imageId);
        // Cleanup preview URL
        const removedImage = prev.find((img) => img.id === imageId);
        if (removedImage) {
          URL.revokeObjectURL(removedImage.preview);
        }
        return updatedImages;
      });
    },
    [disabled, isUploading],
  );

  const removeUploadedImage = useCallback(
    async (index: number) => {
      if (disabled || isUploading) return;

      const newUrls = [...value];
      const removedUrl = newUrls.splice(index, 1)[0];

      // If we have path tracking, delete from storage
      // For now, we'll just update the state
      // TODO: Implement proper cleanup when we have path tracking

      onChange(newUrls);
    },
    [disabled, isUploading, value, onChange],
  );

  // =============================================================================
  // BATCH UPLOAD
  // =============================================================================

  const handleBatchUpload = useCallback(async () => {
    if (images.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    // Update all images to uploading status
    setImages((prev) =>
      prev.map((img) => ({ ...img, status: "uploading" as const })),
    );

    try {
      // Create FormData with images
      const formData = new FormData();
      images.forEach((img, index) => {
        formData.append(`image-${index}`, img.file);
      });

      // Upload images via server action
      const result = await uploadProjectImages(formData, projectId);

      if (result.success && result.images) {
        // Update successful uploads
        const uploadedUrls = result.images.map((img) => img.url);
        const uploadedPaths = result.images.map((img) => img.path);

        onChange([...value, ...uploadedUrls]);
        if (onPathsChange) {
          // Assuming we have a way to track existing paths
          onPathsChange([...uploadedPaths]);
        }

        // Update image states to uploaded
        setImages((prev) =>
          prev.map((img, index) => ({
            ...img,
            status: "uploaded" as const,
            uploadedUrl: result.images![index]?.url,
            uploadedPath: result.images![index]?.path,
          })),
        );

        // Clear uploaded images after a short delay
        setTimeout(() => {
          setImages([]);
        }, 1000);
      } else {
        // Handle upload errors
        setUploadError(result.error || "Error desconocido en la subida");

        // Update image states to error
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            status: "error" as const,
            error: result.error,
          })),
        );

        // If there were specific file failures
        if (result.failedUploads) {
          const failureMap = new Map(
            result.failedUploads.map((f) => [f.fileName, f.error]),
          );
          setImages((prev) =>
            prev.map((img) => ({
              ...img,
              status: "error" as const,
              error: failureMap.get(img.file.name) || "Error desconocido",
            })),
          );
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Error interno del servidor",
      );

      // Update all images to error status
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          status: "error" as const,
          error: "Error de conexión",
        })),
      );
    } finally {
      setIsUploading(false);
    }
  }, [images, isUploading, value, onChange, onPathsChange, projectId]);

  // =============================================================================
  // RENDER STATUS ICON
  // =============================================================================

  const renderStatusIcon = (status: ImageFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "uploaded":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Already uploaded images */}
      {value.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Imágenes subidas ({value.length})
          </h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {value.map((url, index) => (
              <div
                key={`uploaded-${index}`}
                className={cn("group relative", aspectRatio)}
              >
                <div className="absolute inset-0 overflow-hidden rounded-lg border">
                  <img
                    src={url}
                    alt={`Imagen subida ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(index)}
                    className="absolute top-2 right-2 z-10 rounded-full bg-red-500 p-1 text-white opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-green-500 px-2 py-1 text-xs text-white">
                  <CheckCircle2 className="h-3 w-3" />
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending images */}
      {images.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Imágenes pendientes ({images.length})
            </h4>
            {images.length > 0 && !isUploading && (
              <button
                type="button"
                onClick={handleBatchUpload}
                disabled={disabled}
                className="bg-primaryColor hover:bg-primaryColor/90 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
              >
                <Upload className="mr-2 inline h-4 w-4" />
                Subir {images.length} imagen{images.length > 1 ? "es" : ""}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className={cn("group relative", aspectRatio)}>
                <div
                  className={cn(
                    "absolute inset-0 overflow-hidden rounded-lg border-2",
                    img.status === "error" && "border-red-300",
                    img.status === "uploaded" && "border-green-300",
                    img.status === "uploading" && "border-blue-300",
                    img.status === "pending" && "border-gray-300",
                  )}
                >
                  <img
                    src={img.preview}
                    alt={`Preview ${img.file.name}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </div>

                {!disabled && img.status !== "uploading" && (
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 z-10 rounded-full bg-red-500 p-1 text-white opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Status indicator */}
                <div
                  className={cn(
                    "absolute bottom-2 left-2 flex items-center gap-1 rounded px-2 py-1 text-xs text-white",
                    img.status === "pending" && "bg-gray-500",
                    img.status === "uploading" && "bg-blue-500",
                    img.status === "uploaded" && "bg-green-500",
                    img.status === "error" && "bg-red-500",
                  )}
                >
                  {renderStatusIcon(img.status)}
                  {img.status === "pending" && "Pendiente"}
                  {img.status === "uploading" && "Subiendo..."}
                  {img.status === "uploaded" && "Subida"}
                  {img.status === "error" && "Error"}
                </div>

                {/* Error tooltip */}
                {img.status === "error" && img.error && (
                  <div className="absolute top-2 left-2 max-w-32 rounded bg-red-500 p-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {img.error}
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
              {value.length === 0 && images.length === 0 ? (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              ) : (
                <Plus className="h-8 w-8 text-gray-400" />
              )}
            </div>

            <p className="mb-2 text-lg font-medium">
              {value.length === 0 && images.length === 0
                ? placeholder
                : "Agregar más imágenes"}
            </p>

            <p className="mb-4 text-center text-sm">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>

            <div className="text-center text-xs text-gray-400">
              <p>JPG, PNG, WebP. Máximo 10MB por imagen</p>
              <p>
                {value.length + images.length} / {maxImages} imágenes
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
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
            Límite de {maxImages} imágenes alcanzado
          </p>
        </div>
      )}

      {/* Global upload progress */}
      {isUploading && (
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">
              Subiendo {images.length} imagen{images.length > 1 ? "es" : ""}...
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
};
