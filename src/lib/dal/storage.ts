// =============================================================================
// STORAGE DATA ACCESS LAYER
// File storage operations using Supabase Storage
// Following project patterns: functions, not classes
// =============================================================================

import { createClient } from "@/lib/supabase/server";
import { deleteFileFromS3, uploadFileToS3 } from "@/lib/supabase/storage";

import { failure, success, type Result } from "./base";

// =============================================================================
// TYPES
// =============================================================================

export interface StorageFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  bucket: string;
  path: string;
  uploadedAt: Date;
}

export interface UploadOptions {
  bucket: string;
  folder?: string;
  fileName?: string;
  isPublic?: boolean;
  maxSize?: number;
  allowedMimeTypes?: string[];
}

export interface BatchUploadResult {
  successful: StorageFile[];
  failed: Array<{
    fileName: string;
    error: string;
  }>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const STORAGE_BUCKETS = {
  IMAGES: "files",
  DOCUMENTS: "files",
  AVATARS: "files",
} as const;

export const STORAGE_FOLDERS = {
  PROJECTS: "projects",
  UNITS: "units",
  ORGANIZATIONS: "organizations",
  AVATARS: "avatars",
} as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

function validateFile(file: File, options: UploadOptions): string | null {
  // Check file size
  const maxSize = options.maxSize || MAX_FILE_SIZE;
  if (file.size > maxSize) {
    return `File size exceeds maximum allowed size of ${Math.round(maxSize / (1024 * 1024))}MB`;
  }

  // Check MIME type
  const allowedTypes = options.allowedMimeTypes || ALLOWED_IMAGE_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return `File type ${file.type} is not allowed`;
  }

  return null;
}

function generateFileName(file: File, folder?: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split(".").pop();
  const baseName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase();

  const fileName = `${baseName}-${timestamp}-${randomSuffix}.${extension}`;
  return folder ? `${folder}/${fileName}` : fileName;
}

// =============================================================================
// CORE STORAGE FUNCTIONS
// =============================================================================

export async function uploadFile(
  file: File,
  options: UploadOptions,
): Promise<Result<StorageFile>> {
  try {
    // Validate file
    const validationError = validateFile(file, options);
    if (validationError) {
      return failure(validationError);
    }

    // Generate file path
    const fileName = options.fileName || generateFileName(file, options.folder);

    // Upload using S3 client
    const uploadResult = await uploadFileToS3(file, fileName, options.bucket);

    if (!uploadResult.data) {
      return failure(uploadResult.error || "Error uploading file");
    }

    const storageFile: StorageFile = {
      id: uploadResult.data.key,
      name: file.name,
      url: uploadResult.data.url,
      size: file.size,
      mimeType: file.type,
      bucket: options.bucket,
      path: uploadResult.data.key,
      uploadedAt: new Date(),
    };

    return success(storageFile);
  } catch (error) {
    return failure(
      `Unexpected error during file upload: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function uploadFiles(
  files: File[],
  options: UploadOptions,
): Promise<Result<BatchUploadResult>> {
  try {
    const successful: StorageFile[] = [];
    const failed: Array<{ fileName: string; error: string }> = [];

    // Process files sequentially to avoid overwhelming storage
    for (const file of files) {
      const result = await uploadFile(file, options);

      if (result.data) {
        successful.push(result.data);
      } else {
        failed.push({
          fileName: file.name,
          error: result.error || "Unknown error",
        });
      }
    }

    const batchResult: BatchUploadResult = {
      successful,
      failed,
    };

    return success(batchResult);
  } catch (error) {
    return failure(
      `Unexpected error during batch upload: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function deleteFile(
  path: string,
  bucket: string,
): Promise<Result<boolean>> {
  try {
    const deleteResult = await deleteFileFromS3(path, bucket);
    return deleteResult;
  } catch (error) {
    return failure(
      `Unexpected error deleting file: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function deleteFiles(
  paths: string[],
  bucket: string,
): Promise<Result<{ deleted: string[]; failed: string[] }>> {
  try {
    const deleted: string[] = [];
    const failed: string[] = [];

    for (const path of paths) {
      const result = await deleteFile(path, bucket);
      if (result.data) {
        deleted.push(path);
      } else {
        failed.push(path);
      }
    }

    return success({ deleted, failed });
  } catch (error) {
    return failure(
      `Unexpected error during batch delete: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export async function uploadImage(
  file: File,
  folder?: string,
): Promise<Result<StorageFile>> {
  return uploadFile(file, {
    bucket: STORAGE_BUCKETS.IMAGES,
    folder,
    isPublic: true,
    maxSize: MAX_FILE_SIZE,
    allowedMimeTypes: ALLOWED_IMAGE_TYPES,
  });
}

export async function uploadImages(
  files: File[],
  folder?: string,
): Promise<Result<BatchUploadResult>> {
  return uploadFiles(files, {
    bucket: STORAGE_BUCKETS.IMAGES,
    folder,
    isPublic: true,
    maxSize: MAX_FILE_SIZE,
    allowedMimeTypes: ALLOWED_IMAGE_TYPES,
  });
}

export async function uploadProjectImages(
  files: File[],
  projectId?: string,
): Promise<Result<BatchUploadResult>> {
  const folder = projectId
    ? `${STORAGE_FOLDERS.PROJECTS}/${projectId}`
    : STORAGE_FOLDERS.PROJECTS;
  return uploadImages(files, folder);
}

export async function uploadOrganizationImages(
  files: File[],
  organizationId?: string,
): Promise<Result<BatchUploadResult>> {
  const folder = organizationId
    ? `${STORAGE_FOLDERS.ORGANIZATIONS}/${organizationId}`
    : STORAGE_FOLDERS.ORGANIZATIONS;
  return uploadImages(files, folder);
}
