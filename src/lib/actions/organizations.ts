// =============================================================================
// ORGANIZATIONS SERVER ACTIONS
// Server actions for organization management
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import {
  validateSession,
  requireRole,
  requireOrganizationAccess,
} from '@/lib/auth/validation';
import {
  getOrganizations,
  getOrganizationById,
  getOrganizationBySlug,
  createOrganization,
  updateOrganization,
  getOrganizationStats,
  getUserOrganizations,
} from '@/lib/dal/organizations';
import type { OrganizationStatus } from '@prisma/client';

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
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  status: OrganizationStatus;
  settings: any;
}

interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  status?: OrganizationStatus;
  settings?: any;
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
  filters: OrganizationFiltersInput = { page: 1, pageSize: 20 }
): Promise<OrganizationActionResult> {
  try {
    // Validate authentication and authorization
    const authResult = await requireRole('admin');
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Get organizations
    const result = await getOrganizations(filters);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[SERVER_ACTION] Error getting organizations:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error obteniendo organizaciones',
    };
  }
}

/**
 * Get organization by ID
 * Requires organization access
 */
export async function getOrganizationByIdAction(
  organizationId: string
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
    console.error('[SERVER_ACTION] Error getting organization:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error obteniendo organización',
    };
  }
}

/**
 * Get organization by slug
 * Public access - no auth required
 */
export async function getOrganizationBySlugAction(
  slug: string
): Promise<OrganizationActionResult> {
  try {
    const result = await getOrganizationBySlug(slug);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[SERVER_ACTION] Error getting organization by slug:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error obteniendo organización',
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
  userAgent?: string
): Promise<OrganizationActionResult> {
  try {
    // Validate authentication and authorization
    const authResult = await requireRole('admin');
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const userId = authResult.user!.id;

    // Create organization
    const result = await createOrganization(
      input,
      userId,
      ipAddress,
      userAgent
    );
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath('/organizations');

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[SERVER_ACTION] Error creating organization:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Error creando organización',
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
  userAgent?: string
): Promise<OrganizationActionResult> {
  try {
    // Validate authentication and check if user is admin or organization owner
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const isAdmin = user.userRoles.some((role) => role.role === 'admin');
    const isOrgOwner = user.userRoles.some(
      (role) =>
        role.role === 'organization_owner' &&
        role.organizationId === organizationId
    );

    if (!isAdmin && !isOrgOwner) {
      return {
        success: false,
        error:
          'Solo administradores o propietarios de organización pueden actualizar esta información',
      };
    }

    // Update organization
    const result = await updateOrganization(
      organizationId,
      input,
      user.id,
      ipAddress,
      userAgent
    );
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath('/organizations');
    revalidatePath(`/organizations/${organizationId}`);

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[SERVER_ACTION] Error updating organization:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error actualizando organización',
    };
  }
}

/**
 * Get organization statistics
 * Requires organization access
 */
export async function getOrganizationStatsAction(
  organizationId: string
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
    console.error('[SERVER_ACTION] Error getting organization stats:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error obteniendo estadísticas',
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
    console.error('[SERVER_ACTION] Error getting user organizations:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error obteniendo organizaciones del usuario',
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
      (role) => role.organizationId && role.isActive
    );

    if (!primaryOrgRole || !primaryOrgRole.organizationId) {
      return {
        success: false,
        error: 'Usuario no pertenece a ninguna organización',
      };
    }

    // Get the organization details
    const result = await getOrganizationById(primaryOrgRole.organizationId);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[SERVER_ACTION] Error getting primary organization:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error obteniendo organización principal',
    };
  }
}
