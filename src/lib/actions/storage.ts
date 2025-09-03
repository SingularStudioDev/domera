// =============================================================================
// STORAGE SERVER ACTIONS FOR DOMERA PLATFORM
// Server actions for file and image upload operations
// Following project patterns: simple functions, not classes
// =============================================================================

"use server";

import { requireRole, validateSession } from "@/lib/auth/validation";
import {
  uploadOrganizationImages as dalUploadOrganizationImages,
  uploadProjectImages as dalUploadProjectImages,
  STORAGE_BUCKETS,
} from "@/lib/dal/storage";
import type { BatchUploadResult, StorageFile } from "@/lib/dal/storage";

// =============================================================================
// TYPES
// =============================================================================

interface ImageUploadResult {
  success: boolean;
  images?: Array<{
    id: string;
    name: string;
    url: string;
    path: string;
  }>;
  error?: string;
  failedUploads?: Array<{
    fileName: string;
    error: string;
  }>;
}

// =============================================================================
// PROJECT IMAGE UPLOADS
// =============================================================================

export async function uploadProjectImages(
  formData: FormData,
  projectId?: string,
): Promise<ImageUploadResult> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Extract files from FormData
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image-") && value instanceof File && value.size > 0) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return { success: false, error: "No se encontraron imágenes válidas" };
    }

    // Validate file count
    if (files.length > 20) {
      return { success: false, error: "Máximo 20 imágenes permitidas" };
    }

    // Upload images using DAL
    const result = await dalUploadProjectImages(files, projectId);

    if (!result.data) {
      return {
        success: false,
        error: result.error || "Error desconocido en la subida",
      };
    }

    // Check if there were any failures
    const batchResult = result.data;
    if (batchResult.failed.length > 0 && batchResult.successful.length === 0) {
      // All failed
      return {
        success: false,
        error: "Error en la subida de todas las imágenes",
        failedUploads: batchResult.failed,
      };
    }

    // Convert to expected format
    const images = batchResult.successful.map((img) => ({
      id: img.id,
      name: img.name,
      url: img.url,
      path: img.path,
    }));

    const response: ImageUploadResult = {
      success: true,
      images,
    };

    // Include failed uploads if any
    if (batchResult.failed.length > 0) {
      response.failedUploads = batchResult.failed;
    }

    return response;
  } catch (error) {
    console.error("Error uploading project images:", error);
    return {
      success: false,
      error: `Error interno del servidor: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// =============================================================================
// ORGANIZATION IMAGE UPLOADS
// =============================================================================

export async function uploadOrganizationImages(
  formData: FormData,
  organizationId?: string,
): Promise<ImageUploadResult> {
  try {
    // Validate session and admin role
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Check role - only admins can upload organization images
    if (
      session.user.role !== "super_admin" &&
      session.user.role !== "domera_admin"
    ) {
      return {
        success: false,
        error: "No tienes permisos para subir imágenes de organización",
      };
    }

    // Extract files from FormData
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image-") && value instanceof File && value.size > 0) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return { success: false, error: "No se encontraron imágenes válidas" };
    }

    // Validate file count
    if (files.length > 10) {
      return {
        success: false,
        error: "Máximo 10 imágenes permitidas para organizaciones",
      };
    }

    // Upload images using DAL
    const result = await dalUploadOrganizationImages(files, organizationId);

    if (!result.data) {
      return {
        success: false,
        error: result.error || "Error desconocido en la subida",
      };
    }

    // Check if there were any failures
    const batchResult = result.data;
    if (batchResult.failed.length > 0 && batchResult.successful.length === 0) {
      // All failed
      return {
        success: false,
        error: "Error en la subida de todas las imágenes",
        failedUploads: batchResult.failed,
      };
    }

    // Convert to expected format
    const images = batchResult.successful.map((img) => ({
      id: img.id,
      name: img.name,
      url: img.url,
      path: img.path,
    }));

    const response: ImageUploadResult = {
      success: true,
      images,
    };

    // Include failed uploads if any
    if (batchResult.failed.length > 0) {
      response.failedUploads = batchResult.failed;
    }

    return response;
  } catch (error) {
    console.error("Error uploading organization images:", error);
    return {
      success: false,
      error: `Error interno del servidor: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// =============================================================================
// UNIT IMAGE UPLOADS
// =============================================================================

export async function uploadUnitImages(
  formData: FormData,
  unitId?: string,
): Promise<ImageUploadResult> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Extract files from FormData
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image-") && value instanceof File && value.size > 0) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return { success: false, error: "No se encontraron imágenes válidas" };
    }

    // Validate file count
    if (files.length > 15) {
      return {
        success: false,
        error: "Máximo 15 imágenes permitidas por unidad",
      };
    }

    // For now, use same logic as projects with units folder
    // TODO: Create specific uploadUnitImages function in DAL
    const folder = unitId ? `units/${unitId}` : "units";
    const result = await dalUploadProjectImages(files, folder);

    if (!result.data) {
      return {
        success: false,
        error: result.error || "Error desconocido en la subida",
      };
    }

    // Check if there were any failures
    const batchResult = result.data;
    if (batchResult.failed.length > 0 && batchResult.successful.length === 0) {
      // All failed
      return {
        success: false,
        error: "Error en la subida de todas las imágenes",
        failedUploads: batchResult.failed,
      };
    }

    // Convert to expected format
    const images = batchResult.successful.map((img) => ({
      id: img.id,
      name: img.name,
      url: img.url,
      path: img.path,
    }));

    const response: ImageUploadResult = {
      success: true,
      images,
    };

    // Include failed uploads if any
    if (batchResult.failed.length > 0) {
      response.failedUploads = batchResult.failed;
    }

    return response;
  } catch (error) {
    console.error("Error uploading unit images:", error);
    return {
      success: false,
      error: `Error interno del servidor: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// =============================================================================
// DELETE IMAGES
// =============================================================================

export async function deleteImages(
  paths: string[],
  bucket: string = STORAGE_BUCKETS.IMAGES,
): Promise<{
  success: boolean;
  error?: string;
  deleted?: string[];
  failed?: string[];
}> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Import deleteFiles function
    const { deleteFiles } = await import("@/lib/dal/storage");

    const result = await deleteFiles(paths, bucket);

    if (!result.data) {
      return {
        success: false,
        error: result.error || "Error eliminando archivos",
      };
    }

    return {
      success: true,
      deleted: result.data.deleted,
      failed: result.data.failed,
    };
  } catch (error) {
    console.error("Error deleting images:", error);
    return {
      success: false,
      error: `Error interno del servidor: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// =============================================================================
// AVATAR UPLOADS
// =============================================================================

export async function uploadAvatar(
  formData: FormData,
): Promise<ImageUploadResult> {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Extract single file from FormData
    const file = formData.get("avatar") as File;
    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: "No se encontró un archivo válido" };
    }

    // Validate file size (2MB max for avatars)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: "El avatar no puede exceder 2MB" };
    }

    // Upload single file using DAL
    const { uploadFile, STORAGE_BUCKETS, STORAGE_FOLDERS } = await import(
      "@/lib/dal/storage"
    );

    const result = await uploadFile(file, {
      bucket: STORAGE_BUCKETS.IMAGES,
      folder: `${STORAGE_FOLDERS.AVATARS}/${session.user.id}`,
      isPublic: true,
      maxSize: 2 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    });

    if (!result.data) {
      return {
        success: false,
        error: result.error || "Error subiendo avatar",
      };
    }

    const image = {
      id: result.data.id,
      name: result.data.name,
      url: result.data.url,
      path: result.data.path,
    };

    return {
      success: true,
      images: [image],
    };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return {
      success: false,
      error: `Error interno del servidor: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
