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

import { useBatchImageUpload } from "@/hooks/useBatchImageUpload";

// =============================================================================
// TYPES
// =============================================================================

interface OptimizedImageUploadProps {
  value: string[]; // URLs of uploaded images
  onChange: (urls: string[]) => void;
  onFilesChange?: (files: File[]) => void; // For deferred upload mode
  onPathsChange?: (paths: string[]) => void;
  entityId?: string;
  entityType: "project" | "organization" | "unit";
  maxImages?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  aspectRatio?: string;
  showUploadButton?: boolean;
  deferUpload?: boolean; // New prop to defer uploads until form submission
}

// =============================================================================
// COMPONENT
// =============================================================================

export const OptimizedImageUpload: React.FC<OptimizedImageUploadProps> = ({
  value = [],
  onChange,
  onFilesChange,
  onPathsChange,
  entityId,
  entityType,
  maxImages = 20,
  placeholder = "Agregar imágenes",
  className,
  disabled = false,
  aspectRatio = "aspect-video",
  showUploadButton = true,
  deferUpload = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [storedPaths, setStoredPaths] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use batch upload hook
  const {
    images,
    isUploading,
    uploadError,
    canAddMore,
    addImages,
    removeImage,
    uploadImages,
    clearError,
  } = useBatchImageUpload({
    maxImages: maxImages - value.length,
    onUploadComplete: (urls, paths) => {
      onChange([...value, ...urls]);
      if (onPathsChange) {
        onPathsChange([...storedPaths, ...paths]);
        setStoredPaths((prev) => [...prev, ...paths]);
      }
    },
    onError: (error) => {
      console.error("Upload error:", error);
    },
  });

  // =============================================================================
  // FILE HANDLING
  // =============================================================================

  const handleFileSelect = useCallback(
    (files: FileList | File[]) => {
      if (disabled) return;
      
      const fileArray = Array.from(files);
      
      if (deferUpload) {
        // In deferred mode, just store the files and create preview URLs
        const newFiles = [...selectedFiles, ...fileArray].slice(0, maxImages);
        setSelectedFiles(newFiles);
        
        // Create preview URLs for display
        const previewUrls = newFiles.map(file => URL.createObjectURL(file));
        onChange([...value.filter(url => !url.startsWith('blob:')), ...previewUrls]);
        
        // Notify parent about file changes
        if (onFilesChange) {
          onFilesChange(newFiles);
        }
      } else {
        // Original immediate upload mode
        if (isUploading) return;
        addImages(fileArray);
      }
    },
    [disabled, isUploading, addImages, deferUpload, selectedFiles, maxImages, onChange, value, onFilesChange],
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileSelect],
  );

  // =============================================================================
  // UPLOAD HANDLING
  // =============================================================================

  const handleUpload = useCallback(async () => {
    if (images.length === 0) return;
    await uploadImages(entityType, entityId);
  }, [images.length, uploadImages, entityType, entityId]);

  // =============================================================================
  // EXISTING IMAGE MANAGEMENT
  // =============================================================================

  const removeExistingImage = useCallback(
    (index: number) => {
      if (disabled || isUploading) return;

      const newUrls = [...value];
      newUrls.splice(index, 1);
      onChange(newUrls);

      // Also remove from paths if tracking
      if (onPathsChange && storedPaths.length > index) {
        const newPaths = [...storedPaths];
        newPaths.splice(index, 1);
        setStoredPaths(newPaths);
        onPathsChange(newPaths);
      }
    },
    [disabled, isUploading, value, onChange, onPathsChange, storedPaths],
  );

  // =============================================================================
  // STATUS ICON HELPER
  // =============================================================================

  const renderStatusIcon = (status: string) => {
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

  // Calculate total capacity
  const totalImages = value.length + images.length;
  const canAddMoreImages = totalImages < maxImages;

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Existing uploaded images */}
      {value.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Imágenes guardadas ({value.length})
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
                    alt={`Imagen ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </div>

                {!disabled && !isUploading && (
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
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
            {showUploadButton && images.length > 0 && !isUploading && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={disabled}
                className="bg-primaryColor hover:bg-primaryColor/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
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
                    img.status === "uploading" &&
                      "animate-pulse border-blue-300",
                    img.status === "pending" && "border-gray-300",
                  )}
                >
                  <img
                    src={img.preview}
                    alt={`Preview ${img.file.name}`}
                    className="h-full w-full object-cover"
                  />
                  {img.status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  )}
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
                  {img.status === "pending" && "Listo"}
                  {img.status === "uploading" && "Subiendo..."}
                  {img.status === "uploaded" && "Subida"}
                  {img.status === "error" && "Error"}
                </div>

                {/* Error message */}
                {img.status === "error" && img.error && (
                  <div className="absolute top-2 left-2 z-20 max-w-32 rounded bg-red-500 p-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {img.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload area */}
      {canAddMoreImages && !isUploading && (
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
              {totalImages === 0 ? (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              ) : (
                <Plus className="h-8 w-8 text-gray-400" />
              )}
            </div>

            <p className="mb-2 text-lg font-medium">
              {totalImages === 0 ? placeholder : "Agregar más imágenes"}
            </p>

            <p className="mb-4 text-center text-sm">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>

            <div className="text-center text-xs text-gray-400">
              <p>JPG, PNG, WebP, AVIF. Máximo 10MB por imagen</p>
              <p>
                {totalImages} / {maxImages} imágenes
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

      {/* Capacity limit message */}
      {!canAddMoreImages && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-sm text-amber-600">
            Límite de {maxImages} imágenes alcanzado
          </p>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-sm font-medium">
              Subiendo{" "}
              {images.filter((img) => img.status === "uploading").length}{" "}
              imagen(es)...
            </p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-blue-200">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
              style={{
                width: `${(images.filter((img) => img.status !== "pending").length / images.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600">
                Error en la subida
              </p>
              <p className="mt-1 text-sm whitespace-pre-line text-red-600">
                {uploadError}
              </p>
              <button
                type="button"
                onClick={clearError}
                className="mt-2 text-xs text-red-600 underline hover:no-underline"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
