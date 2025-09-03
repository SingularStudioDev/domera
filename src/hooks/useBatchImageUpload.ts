"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  uploadOrganizationImages,
  uploadProjectImages,
  uploadUnitImages,
} from "@/lib/actions/storage";
import { validateImageFiles } from "@/lib/utils/images";

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

interface UploadResult {
  success: boolean;
  images?: Array<{ url: string; path: string }>;
  error?: string;
  failedUploads?: Array<{ fileName: string; error: string }>;
}

interface UseBatchImageUploadProps {
  maxImages?: number;
  onUploadComplete?: (urls: string[], paths: string[]) => void;
  onError?: (error: string) => void;
}

interface UseBatchImageUploadReturn {
  images: ImageFile[];
  isUploading: boolean;
  uploadError: string | null;
  canAddMore: boolean;
  addImages: (files: File[]) => void;
  removeImage: (imageId: string) => void;
  uploadImages: (
    type: "project" | "organization" | "unit",
    entityId?: string,
  ) => Promise<void>;
  clearImages: () => void;
  clearError: () => void;
}

// =============================================================================
// HOOK
// =============================================================================

export function useBatchImageUpload({
  maxImages = 20,
  onUploadComplete,
  onError,
}: UseBatchImageUploadProps = {}): UseBatchImageUploadReturn {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadIdRef = useRef<string | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 15);
  const canAddMore = images.length < maxImages;

  // =============================================================================
  // ADD IMAGES
  // =============================================================================

  const addImages = useCallback(
    (files: File[]) => {
      if (isUploading) return;

      const { valid, invalid } = validateImageFiles(files);

      // Show validation errors
      if (invalid.length > 0) {
        const errors = invalid.map(
          (item) => `${item.file.name}: ${item.reason}`,
        );
        const errorMessage = `Archivos inválidos:\n${errors.join("\n")}`;
        setUploadError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      // Check total limit
      const totalImages = images.length + valid.length;
      if (totalImages > maxImages) {
        const remainingSlots = maxImages - images.length;
        const errorMessage = `Solo puedes agregar ${remainingSlots} imagen${remainingSlots === 1 ? "" : "es"} más (${valid.length} seleccionada${valid.length === 1 ? "" : "s"})`;
        setUploadError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      // Add new images to pending list
      const newImages: ImageFile[] = valid.map((file) => ({
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
        status: "pending",
      }));

      setImages((prev) => [...prev, ...newImages]);
      setUploadError(null);
    },
    [images.length, maxImages, isUploading, onError],
  );

  // =============================================================================
  // REMOVE IMAGE
  // =============================================================================

  const removeImage = useCallback(
    (imageId: string) => {
      if (isUploading) return;

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
    [isUploading],
  );

  // =============================================================================
  // UPLOAD IMAGES
  // =============================================================================

  const uploadImages = useCallback(
    async (type: "project" | "organization" | "unit", entityId?: string) => {
      // Filter out images that are already uploaded
      const imagesToUpload = images.filter((img) => img.status === "pending");

      if (imagesToUpload.length === 0 || isUploading) return;

      const currentUploadId = generateId();
      uploadIdRef.current = currentUploadId;

      setIsUploading(true);
      setUploadError(null);

      // Update only pending images to uploading status
      setImages((prev) =>
        prev.map((img) =>
          img.status === "pending"
            ? { ...img, status: "uploading" as const }
            : img,
        ),
      );

      try {
        // Create FormData with only pending images
        const formData = new FormData();
        imagesToUpload.forEach((img, index) => {
          formData.append(`image-${index}`, img.file);
        });

        let result: UploadResult;

        // Choose appropriate upload action
        switch (type) {
          case "project":
            result = await uploadProjectImages(formData, entityId);
            break;
          case "organization":
            result = await uploadOrganizationImages(formData, entityId);
            break;
          case "unit":
            result = await uploadUnitImages(formData, entityId);
            break;
          default:
            throw new Error(`Tipo de upload no soportado: ${type}`);
        }

        // Check if this upload is still current (prevent race conditions)
        if (uploadIdRef.current !== currentUploadId) {
          return;
        }

        if (result.success && result.images) {
          // Extract URLs and paths
          const urls = result.images.map((img) => img.url);
          const paths = result.images.map((img) => img.path);

          // Update only the images that were uploaded to uploaded status
          setImages((prev) => {
            let uploadedIndex = 0;
            return prev.map((img) => {
              if (img.status === "uploading") {
                const uploadedImg = {
                  ...img,
                  status: "uploaded" as const,
                  uploadedUrl: result.images![uploadedIndex]?.url,
                  uploadedPath: result.images![uploadedIndex]?.path,
                };
                uploadedIndex++;
                return uploadedImg;
              }
              return img;
            });
          });

          // Notify parent component
          onUploadComplete?.(urls, paths);

          // Clear only uploaded images after showing success state briefly
          setTimeout(() => {
            if (uploadIdRef.current === currentUploadId) {
              setImages((prev) =>
                prev.filter((img) => img.status !== "uploaded"),
              );
              // Cleanup URLs for uploaded images only
              prev
                .filter((img) => img.status === "uploaded")
                .forEach((img) => URL.revokeObjectURL(img.preview));
            }
          }, 1000); // Show success for 1 second, then remove uploaded images
        } else {
          // Handle upload errors
          const errorMessage = result.error || "Error desconocido en la subida";
          setUploadError(errorMessage);
          onError?.(errorMessage);

          // Update image states based on specific failures
          if (result.failedUploads) {
            const failureMap = new Map(
              result.failedUploads.map((f) => [f.fileName, f.error]),
            );
            setImages((prev) =>
              prev.map((img) =>
                img.status === "uploading"
                  ? {
                      ...img,
                      status: "error" as const,
                      error:
                        failureMap.get(img.file.name) || "Error desconocido",
                    }
                  : img,
              ),
            );
          } else {
            // General error for uploading images only
            setImages((prev) =>
              prev.map((img) =>
                img.status === "uploading"
                  ? {
                      ...img,
                      status: "error" as const,
                      error: errorMessage,
                    }
                  : img,
              ),
            );
          }
        }
      } catch (error) {
        if (uploadIdRef.current !== currentUploadId) {
          return;
        }

        console.error("Upload error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Error interno del servidor";
        setUploadError(errorMessage);
        onError?.(errorMessage);

        // Update only uploading images to error status
        setImages((prev) =>
          prev.map((img) =>
            img.status === "uploading"
              ? {
                  ...img,
                  status: "error" as const,
                  error: "Error de conexión",
                }
              : img,
          ),
        );
      } finally {
        if (uploadIdRef.current === currentUploadId) {
          setIsUploading(false);
          uploadIdRef.current = null;
        }
      }
    },
    [images, isUploading, onUploadComplete, onError],
  );

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const clearImages = useCallback(() => {
    // Cleanup preview URLs
    images.forEach((img) => {
      URL.revokeObjectURL(img.preview);
    });
    setImages([]);
  }, [images]);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  // =============================================================================
  // CLEANUP ON UNMOUNT
  // =============================================================================

  useEffect(() => {
    return () => {
      // Cleanup preview URLs on unmount
      images.forEach((img) => {
        URL.revokeObjectURL(img.preview);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    images,
    isUploading,
    uploadError,
    canAddMore,
    addImages,
    removeImage,
    uploadImages,
    clearImages,
    clearError,
  };
}
