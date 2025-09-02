// =============================================================================
// IMAGE UTILITY FUNCTIONS FOR DOMERA PLATFORM
// Client-side utility functions for image processing and validation
// Created: September 2025
// =============================================================================

/**
 * Convert File objects to image URLs for processing
 * This is used when we need to store images in batch with other data
 */
export function processImageFiles(files: File[]): Array<{ file: File; preview: string }> {
  return files.map(file => ({
    file,
    preview: URL.createObjectURL(file)
  }));
}

/**
 * Validate image files before upload
 * Same validation logic as DAL but for client-side
 */
export function validateImageFiles(files: File[]): { valid: File[]; invalid: Array<{ file: File; reason: string }> } {
  const valid: File[] = [];
  const invalid: Array<{ file: File; reason: string }> = [];

  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

  for (const file of files) {
    if (file.size > maxSize) {
      invalid.push({ file, reason: `File size exceeds maximum allowed size of ${Math.round(file.size / (1024 * 1024))}MB` });
      continue;
    }

    if (!allowedTypes.includes(file.type)) {
      invalid.push({ file, reason: `File type ${file.type} is not allowed` });
      continue;
    }

    valid.push(file);
  }

  return { valid, invalid };
}