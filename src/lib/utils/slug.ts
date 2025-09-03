// =============================================================================
// SLUG UTILITY FUNCTIONS
// Helper functions for generating URL-friendly slugs
// =============================================================================

/**
 * Convert a string to a URL-friendly slug
 * @param text - The text to convert to slug
 * @returns A kebab-case slug
 */
export function generateSlug(text: string): string {
  if (!text) return "";

  return (
    text
      .trim()
      .toLowerCase()
      // Replace spaces and special characters with hyphens
      .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, "")
  ); // Remove leading/trailing hyphens
}

/**
 * Check if a slug is valid (basic validation)
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;

  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with hyphen
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
