// =============================================================================
// ORGANIZATIONS SERVER ACTIONS
// Server actions for organization management
// =============================================================================

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import type { OrganizationStatus } from "@prisma/client";

import {
  requireOrganizationAccess,
  requireRole,
  validateSession,
} from "@/lib/auth/validation";
import {
  createOrganization,
  getOrganizationById,
  getOrganizationBySlug,
  getOrganizations,
  getOrganizationStats,
  getUserOrganizations,
  updateOrganization,
} from "@/lib/dal/organizations";

import { validateSuperAdminSession } from "../auth/super-admin";
import { extractRealIP } from "../utils/security";

// Input types (defined in DAL)
interface OrganizationFiltersInput {
  page: number;
  pageSize: number;
  status?: OrganizationStatus;
  search?: string;
}

interface CreateOrganizationInput {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  websiteUrl?: string;
  description?: string;
  status: OrganizationStatus;
  logoUrl?: string;
}

interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  websiteUrl?: string;
  description?: string;
  status?: OrganizationStatus;
  logoUrl?: string;
}

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface OrganizationActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// =============================================================================
// SERVER ACTIONS FOR ORGANIZATIONS
// =============================================================================

/**
 * Get all organizations with filters and pagination
 * Requires admin role
 */
export async function getOrganizationsAction(
  filters: OrganizationFiltersInput = { page: 1, pageSize: 20 },
): Promise<OrganizationActionResult> {
  try {
    // Try super admin authentication first (for /super routes)
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");

    let isAuthenticated = false;

    // Check for super admin session
    const sessionCookies = cookieHeader
      ?.split(";")
      .filter((c) => c.trim().startsWith("super-admin-session="))
      .map((c) => c.split("=")[1]);

    const sessionCookie = sessionCookies?.pop();

    if (sessionCookie) {
      const ipAddress = extractRealIP(headersList);
      const sessionValidation = await validateSuperAdminSession(
        sessionCookie,
        ipAddress,
      );

      if (sessionValidation.valid && sessionValidation.userId) {
        isAuthenticated = true;
      }
    }

    // If super admin auth failed, try regular NextAuth
    if (!isAuthenticated) {
      const authResult = await requireRole("admin");

      if (authResult.success) {
        isAuthenticated = true;
      } else {
        return {
          success: false,
          error: authResult.error || "Usuario no autenticado",
        };
      }
    }

    const result = await getOrganizations(filters);

    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo organizaciones",
    };
  }
}

/**
 * Get organization by ID
 * Requires organization access
 */
export async function getOrganizationByIdAction(
  organizationId: string,
): Promise<OrganizationActionResult> {
  try {
    // Validate authentication and organization access
    const authResult = await requireOrganizationAccess(organizationId);
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Get organization
    const result = await getOrganizationById(organizationId);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting organization:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo organización",
    };
  }
}

/**
 * Get organization by slug
 * Public access - no auth required
 */
export async function getOrganizationBySlugAction(
  slug: string,
): Promise<OrganizationActionResult> {
  try {
    const result = await getOrganizationBySlug(slug);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting organization by slug:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo organización",
    };
  }
}

/**
 * Create new organization
 * Requires admin role
 */
export async function createOrganizationAction(
  input: CreateOrganizationInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<OrganizationActionResult> {
  try {
    // Validate authentication and authorization
    const authResult = await requireRole("admin");
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const userId = authResult.user!.id;

    // Create organization
    const result = await createOrganization(
      input,
      userId,
      ipAddress,
      userAgent,
    );
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/organizations");

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[SERVER_ACTION] Error creating organization:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error creando organización",
    };
  }
}

/**
 * Update organization
 * Requires organization owner role or admin
 */
export async function updateOrganizationAction(
  organizationId: string,
  input: UpdateOrganizationInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<OrganizationActionResult> {
  try {
    // Validate authentication and check if user is admin or organization owner
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const isAdmin = user.userRoles.some((role) => role.role === "admin" && role.organizationId === null);
    const isOrgOwner = user.userRoles.some(
      (role) =>
        role.role === "organization_owner" &&
        role.organizationId === organizationId,
    );

    if (!isAdmin && !isOrgOwner) {
      return {
        success: false,
        error:
          "Solo administradores o propietarios de organización pueden actualizar esta información",
      };
    }

    // Update organization
    const result = await updateOrganization(
      organizationId,
      input,
      user.id,
      ipAddress,
      userAgent,
    );
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/organizations");
    revalidatePath(`/organizations/${organizationId}`);

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[SERVER_ACTION] Error updating organization:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error actualizando organización",
    };
  }
}

/**
 * Get organization statistics
 * Requires organization access
 */
export async function getOrganizationStatsAction(
  organizationId: string,
): Promise<OrganizationActionResult> {
  try {
    // Validate authentication and organization access
    const authResult = await requireOrganizationAccess(organizationId);
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Get statistics
    const result = await getOrganizationStats(organizationId);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting organization stats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo estadísticas",
    };
  }
}

/**
 * Get user's organizations
 * Requires authentication
 */
export async function getUserOrganizationsAction(): Promise<OrganizationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const userId = authResult.user!.id;

    // Get user's organizations
    const result = await getUserOrganizations(userId);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting user organizations:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo organizaciones del usuario",
    };
  }
}

// =============================================================================
// ORGANIZATION LOGO UPLOAD
// =============================================================================

/**
 * Upload organization logo
 * Requires admin role or organization owner
 */
export async function uploadOrganizationLogoAction(
  organizationId: string,
  formData: FormData,
): Promise<OrganizationActionResult> {
  try {
    // Validate authentication and check if user is admin or organization owner
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const isAdmin = user.userRoles.some((role) => role.role === "admin" && role.organizationId === null);
    const isOrgOwner = user.userRoles.some(
      (role) =>
        role.role === "organization_owner" &&
        role.organizationId === organizationId,
    );

    if (!isAdmin && !isOrgOwner) {
      return {
        success: false,
        error:
          "Solo administradores o propietarios de organización pueden subir logos",
      };
    }

    // Extract logo file from FormData
    const logoFile = formData.get("logo") as File;
    if (!logoFile || !(logoFile instanceof File) || logoFile.size === 0) {
      return { success: false, error: "No se encontró un archivo válido" };
    }

    // Validate file size (5MB max for logos)
    if (logoFile.size > 5 * 1024 * 1024) {
      return { success: false, error: "El logo no puede exceder 5MB" };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(logoFile.type)) {
      return {
        success: false,
        error: "Solo se permiten archivos JPG, PNG o WebP",
      };
    }

    // Import storage utilities
    const { uploadFile, STORAGE_BUCKETS, STORAGE_FOLDERS } = await import(
      "@/lib/dal/storage"
    );

    // Upload logo to S3
    const uploadResult = await uploadFile(logoFile, {
      bucket: STORAGE_BUCKETS.IMAGES,
      folder: `${STORAGE_FOLDERS.ORGANIZATIONS}/${organizationId}/logo`,
      isPublic: true,
      maxSize: 5 * 1024 * 1024,
      allowedMimeTypes: allowedTypes,
    });

    if (!uploadResult.data) {
      return {
        success: false,
        error: uploadResult.error || "Error subiendo logo",
      };
    }

    // Update organization with new logo URL
    const updateResult = await updateOrganization(
      organizationId,
      { logoUrl: uploadResult.data.url },
      user.id,
    );

    if (!updateResult.data) {
      return { success: false, error: updateResult.error };
    }

    // Revalidate relevant paths
    revalidatePath("/super/dashboard/organizations");
    revalidatePath(`/super/dashboard/organizations/${organizationId}`);

    return { success: true, data: { logoUrl: uploadResult.data.url } };
  } catch (error) {
    console.error("[SERVER_ACTION] Error uploading organization logo:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error subiendo logo de organización",
    };
  }
}

// =============================================================================
// HELPER ACTIONS
// =============================================================================

/**
 * Get current user's primary organization
 * Requires authentication
 */
export async function getCurrentUserPrimaryOrganization(): Promise<OrganizationActionResult> {
  try {
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;

    // Find the first active organization role
    const primaryOrgRole = user.userRoles.find(
      (role) => role.organizationId && role.isActive,
    );

    if (!primaryOrgRole || !primaryOrgRole.organizationId) {
      return {
        success: false,
        error: "Usuario no pertenece a ninguna organización",
      };
    }

    // Get the organization details
    const result = await getOrganizationById(primaryOrgRole.organizationId);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting primary organization:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo organización principal",
    };
  }
}
