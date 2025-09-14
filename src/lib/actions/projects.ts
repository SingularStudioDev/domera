// =============================================================================
// PROJECTS SERVER ACTIONS
// Server actions for project management - following single responsibility principle
// Only handles project-related operations
// =============================================================================

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import type { ProjectStatus } from "@prisma/client";

import {
  requireOrganizationAccess,
  requireRole,
  validateProjectAccess,
  validateSession,
} from "@/lib/auth/validation";
import { getDbClient } from "@/lib/dal/base";
import {
  createProject,
  getProjectById,
  getProjectBySlug,
  getProjects,
  getProjectStats,
  getPublicProjects,
  updateProject,
} from "@/lib/dal/projects";

import { validateSuperAdminSession } from "../auth/super-admin";
import { extractRealIP } from "../utils/security";
import { serializeProject } from "../utils/serialization";

// Input types
interface ProjectFiltersInput {
  page: number;
  pageSize: number;
  organizationId?: string;
  status?: ProjectStatus;
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  rooms?: string;
  amenities?: string;
}

interface CreateProjectInput {
  name: string;
  slug: string;
  organizationId: string;
  description?: string;
  shortDescription?: string;
  address: string;
  neighborhood?: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  status: ProjectStatus;
  basePrice?: number;
  currency: string;
  images: import("@/types/project-images").ProjectImage[];
  amenities: string[];
  details: string[];
  masterPlanFiles?: Array<{
    id: string;
    name: string;
    url: string;
    path: string;
    size?: number;
    type?: string;
  }>;
  priority?: number;
  startDate?: Date;
  estimatedCompletion?: Date;
  hasParking?: boolean;
  hasStudio?: boolean;
  has1Bedroom?: boolean;
  has2Bedroom?: boolean;
  has3Bedroom?: boolean;
  has4Bedroom?: boolean;
  has5Bedroom?: boolean;
  hasCommercial?: boolean;
}

interface UpdateProjectInput {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
  status?: ProjectStatus;
  basePrice?: number;
  currency?: string;
  images?: import("@/types/project-images").ProjectImage[];
  amenities?: string[];
  details?: string[];
  masterPlanFiles?: Array<{
    id: string;
    name: string;
    url: string;
    path: string;
    size?: number;
    type?: string;
  }>;
  priority?: number;
  startDate?: Date;
  estimatedCompletion?: Date;
  hasParking?: boolean;
  hasStudio?: boolean;
  has1Bedroom?: boolean;
  has2Bedroom?: boolean;
  has3Bedroom?: boolean;
  has4Bedroom?: boolean;
  has5Bedroom?: boolean;
  hasCommercial?: boolean;
}

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ProjectActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// =============================================================================
// SERVER ACTIONS FOR PROJECTS
// =============================================================================

/**
 * Get projects with filters and pagination
 * Supports both super admin and regular user authentication
 */
export async function checkSlugAvailabilityAction(
  slug: string,
  organizationId?: string,
): Promise<{ success: boolean; available: boolean; error?: string }> {
  try {
    if (!slug?.trim()) {
      return { success: false, available: false, error: "Slug es requerido" };
    }

    const client = getDbClient();

    // Check if slug exists in the same organization (if specified)
    const whereClause: any = { slug: slug.trim() };
    if (organizationId) {
      whereClause.organizationId = organizationId;
    }

    const existingProject = await client.project.findFirst({
      where: whereClause,
      select: { id: true, name: true },
    });

    return {
      success: true,
      available: !existingProject,
      error: existingProject
        ? `Slug ya está en uso por el proyecto "${existingProject.name}"`
        : undefined,
    };
  } catch (error) {
    console.error("Error checking slug availability:", error);
    return {
      success: false,
      available: false,
      error: "Error al verificar disponibilidad del slug",
    };
  }
}

export async function getProjectsAction(
  filters: ProjectFiltersInput = { page: 1, pageSize: 20 },
): Promise<ProjectActionResult> {
  try {
    // Try super admin authentication first (for /super routes)
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");

    let isAuthenticated = false;
    let user: any = null;

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
        // For super admin, we allow access to all projects without filtering
      }
    }

    // If super admin auth failed, try regular NextAuth
    if (!isAuthenticated) {
      const authResult = await validateSession();

      if (authResult.success && authResult.user) {
        isAuthenticated = true;
        user = authResult.user;

        // Filter by organization if user is not admin
        const isAdmin = user.userRoles.some((role) => role.role === "admin");
        if (!isAdmin && !filters.organizationId) {
          // Get user's organization
          const userOrg = user.userRoles.find((role) => role.organizationId);
          if (userOrg) {
            filters.organizationId = userOrg.organizationId!;
          }
        }
      } else {
        return {
          success: false,
          error: authResult.error || "Usuario no autenticado",
        };
      }
    }

    // Get projects
    const result = await getProjects(filters);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Serialize the data to handle Decimal fields
    const serializedData = {
      ...result.data,
      data: result.data.data.map((project) => serializeProject(project)),
    };

    return { success: true, data: serializedData };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting projects:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error obteniendo proyectos",
    };
  }
}

/**
 * Get public projects (for non-authenticated users)
 * No authentication required
 */
export async function getPublicProjectsAction(
  filters: Omit<ProjectFiltersInput, "organizationId"> = {
    page: 1,
    pageSize: 20,
  },
): Promise<ProjectActionResult> {
  try {
    // Clean undefined values that might cause validation issues
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== undefined && value !== null,
      ),
    );

    const result = await getPublicProjects(cleanFilters as typeof filters);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    console.log("result ", result.data);
    // Serialize the data to handle Decimal fields
    const serializedData = {
      ...result.data,
      data: result.data.data.map((project) => serializeProject(project)),
    };

    return { success: true, data: serializedData };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting public projects:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo proyectos públicos",
    };
  }
}

/**
 * Get project by ID
 * Public access for browsing
 */
export async function getProjectByIdAction(
  projectId: string,
): Promise<ProjectActionResult> {
  try {
    const result = await getProjectById(projectId);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: serializeProject(result.data) };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting project:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error obteniendo proyecto",
    };
  }
}

/**
 * Get project by slug
 * Public access for browsing
 */
export async function getProjectBySlugAction(
  organizationSlug: string,
  projectSlug: string,
): Promise<ProjectActionResult> {
  try {
    const result = await getProjectBySlug(organizationSlug, projectSlug);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: serializeProject(result.data) };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting project by slug:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error obteniendo proyecto",
    };
  }
}

/**
 * Create new project
 * Requires organization access and appropriate role
 */
export async function createProjectAction(
  input: CreateProjectInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<ProjectActionResult> {
  try {
    // Validate organization access
    const orgAccessResult = await requireOrganizationAccess(
      input.organizationId,
    );
    if (!orgAccessResult.success) {
      return { success: false, error: orgAccessResult.error };
    }

    // Check if user has appropriate role
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const hasPermission = user.userRoles.some((role) =>
      ["admin", "organization_owner", "sales_manager"].includes(role.role),
    );

    if (!hasPermission) {
      return {
        success: false,
        error: "No tienes permisos para crear proyectos",
      };
    }

    // Create project
    const result = await createProject(input, user.id, ipAddress, userAgent);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true, data: serializeProject(result.data) };
  } catch (error) {
    console.error("[SERVER_ACTION] Error creating project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error creando proyecto",
    };
  }
}

/**
 * Update project
 * Requires project access and appropriate role
 */
export async function updateProjectAction(
  projectId: string,
  input: UpdateProjectInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<ProjectActionResult> {
  try {
    // Validate project access
    const projectAccessResult = await validateProjectAccess(projectId);
    if (!projectAccessResult.success) {
      return { success: false, error: projectAccessResult.error };
    }

    // Check if user has appropriate role
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const hasPermission = user.userRoles.some((role) =>
      ["admin", "organization_owner", "sales_manager"].includes(role.role),
    );

    if (!hasPermission) {
      return {
        success: false,
        error: "No tienes permisos para actualizar proyectos",
      };
    }

    // Update project
    const result = await updateProject(
      projectId,
      input,
      user.id,
      ipAddress,
      userAgent,
    );
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/dashboard");

    return { success: true, data: serializeProject(result.data) };
  } catch (error) {
    console.error("[SERVER_ACTION] Error updating project:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error actualizando proyecto",
    };
  }
}

/**
 * Get project statistics
 * Requires project access
 */
export async function getProjectStatsAction(
  projectId: string,
): Promise<ProjectActionResult> {
  try {
    // Validate project access
    const projectAccessResult = await validateProjectAccess(projectId);
    if (!projectAccessResult.success) {
      return { success: false, error: projectAccessResult.error };
    }

    const result = await getProjectStats(projectId);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[SERVER_ACTION] Error getting project stats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo estadísticas del proyecto",
    };
  }
}
