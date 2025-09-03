// =============================================================================
// PROJECT FEATURES SERVER ACTIONS
// Server actions for project features management - following single responsibility principle
// Only handles project feature-related operations
// =============================================================================

"use server";

import { revalidatePath } from "next/cache";

import type { ProjectStatus } from "@prisma/client";

import {
  requireRole,
  validateProjectAccess,
  validateSession,
} from "@/lib/auth/validation";
import {
  getProjectById,
  getProjects,
  getPublicProjects,
  updateProject,
} from "@/lib/dal/projects";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ProjectFeaturesActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ProjectFeatures {
  hasParking: boolean;
  hasStudio: boolean;
  has1Bedroom: boolean;
  has2Bedroom: boolean;
  has3Bedroom: boolean;
  has4Bedroom: boolean;
  has5Bedroom: boolean;
  hasCommercial: boolean;
}

export interface FeatureFilters {
  parking?: boolean;
  roomTypes?: ("studio" | "1bed" | "2bed" | "3bed" | "4bed" | "5bed")[];
  commercial?: boolean;
}

export interface ProjectWithFeatures {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  address: string;
  neighborhood?: string;
  city: string;
  status: string;
  basePrice?: number;
  currency: string;
  totalUnits: number;
  availableUnits: number;
  images: string[];
  amenities: string[];
  features: ProjectFeatures;
  createdAt: Date;
}

// =============================================================================
// PROJECT FEATURES MANAGEMENT
// =============================================================================

/**
 * Update project features (for admins and organization owners)
 */
export async function updateProjectFeaturesAction(
  projectId: string,
  features: Partial<ProjectFeatures>,
  ipAddress?: string,
  userAgent?: string,
): Promise<ProjectFeaturesActionResult> {
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
        error:
          "No tienes permisos para actualizar características de proyectos",
      };
    }

    // Update project using DAL
    const result = await updateProject(
      projectId,
      features,
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

    return {
      success: true,
      data: {
        message: `Características actualizadas para el proyecto`,
        project: result.data,
      },
    };
  } catch (error) {
    console.error("[SERVER_ACTION] Error updating project features:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error actualizando características del proyecto",
    };
  }
}

/**
 * Get project features for a specific project
 * Public access for browsing
 */
export async function getProjectFeaturesAction(
  projectId: string,
): Promise<ProjectFeaturesActionResult> {
  try {
    const result = await getProjectById(projectId);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    const project = result.data;
    const features: ProjectFeatures = {
      hasParking: project.hasParking || false,
      hasStudio: project.hasStudio || false,
      has1Bedroom: project.has1Bedroom || false,
      has2Bedroom: project.has2Bedroom || false,
      has3Bedroom: project.has3Bedroom || false,
      has4Bedroom: project.has4Bedroom || false,
      has5Bedroom: project.has5Bedroom || false,
      hasCommercial: project.hasCommercial || false,
    };

    return {
      success: true,
      data: {
        projectId: project.id,
        projectName: project.name,
        features,
      },
    };
  } catch (error) {
    console.error("[SERVER_ACTION] Error fetching project features:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo características del proyecto",
    };
  }
}

/**
 * Get all projects with their features
 * Public access for browsing
 */
export async function getProjectsWithFeaturesAction(): Promise<ProjectFeaturesActionResult> {
  try {
    const result = await getPublicProjects({ page: 1, pageSize: 100 });
    if (!result.data) {
      return { success: false, error: result.error };
    }

    const projects = result.data.items;
    const projectsWithFeatures: ProjectWithFeatures[] = projects.map(
      (project: any) => ({
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        shortDescription: project.shortDescription,
        address: project.address,
        neighborhood: project.neighborhood,
        city: project.city,
        status: project.status,
        basePrice: project.basePrice ? Number(project.basePrice) : undefined,
        currency: project.currency,
        totalUnits: project.totalUnits || 0,
        availableUnits: project.availableUnits || 0,
        images: Array.isArray(project.images)
          ? project.images
          : JSON.parse((project.images as string) || "[]"),
        amenities: Array.isArray(project.amenities)
          ? project.amenities
          : JSON.parse((project.amenities as string) || "[]"),
        features: {
          hasParking: project.hasParking || false,
          hasStudio: project.hasStudio || false,
          has1Bedroom: project.has1Bedroom || false,
          has2Bedroom: project.has2Bedroom || false,
          has3Bedroom: project.has3Bedroom || false,
          has4Bedroom: project.has4Bedroom || false,
          has5Bedroom: project.has5Bedroom || false,
          hasCommercial: project.hasCommercial || false,
        },
        createdAt: project.createdAt,
      }),
    );

    return {
      success: true,
      data: projectsWithFeatures,
    };
  } catch (error) {
    console.error(
      "[SERVER_ACTION] Error fetching projects with features:",
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo proyectos con características",
    };
  }
}

/**
 * Filter projects by features
 * Public access for browsing
 */
export async function getProjectsByFeaturesAction(
  filters: FeatureFilters,
): Promise<ProjectFeaturesActionResult> {
  try {
    // Note: This would ideally be implemented in the DAL layer with proper filtering
    // For now, we get all projects and filter in memory (not efficient for large datasets)
    const result = await getPublicProjects({ page: 1, pageSize: 1000 });
    if (!result.data) {
      return { success: false, error: result.error };
    }

    let filteredProjects = result.data.items;

    // Apply filters
    if (filters.parking !== undefined) {
      filteredProjects = filteredProjects.filter(
        (p: any) => p.hasParking === filters.parking,
      );
    }

    if (filters.commercial !== undefined) {
      filteredProjects = filteredProjects.filter(
        (p: any) => p.hasCommercial === filters.commercial,
      );
    }

    if (filters.roomTypes && filters.roomTypes.length > 0) {
      filteredProjects = filteredProjects.filter((project: any) => {
        return filters.roomTypes!.some((roomType) => {
          switch (roomType) {
            case "studio":
              return project.hasStudio;
            case "1bed":
              return project.has1Bedroom;
            case "2bed":
              return project.has2Bedroom;
            case "3bed":
              return project.has3Bedroom;
            case "4bed":
              return project.has4Bedroom;
            case "5bed":
              return project.has5Bedroom;
            default:
              return false;
          }
        });
      });
    }

    const projectsWithFeatures: ProjectWithFeatures[] = filteredProjects.map(
      (project: any) => ({
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        shortDescription: project.shortDescription,
        address: project.address,
        neighborhood: project.neighborhood,
        city: project.city,
        status: project.status,
        basePrice: project.basePrice ? Number(project.basePrice) : undefined,
        currency: project.currency,
        totalUnits: project.totalUnits || 0,
        availableUnits: project.availableUnits || 0,
        images: Array.isArray(project.images)
          ? project.images
          : JSON.parse((project.images as string) || "[]"),
        amenities: Array.isArray(project.amenities)
          ? project.amenities
          : JSON.parse((project.amenities as string) || "[]"),
        features: {
          hasParking: project.hasParking || false,
          hasStudio: project.hasStudio || false,
          has1Bedroom: project.has1Bedroom || false,
          has2Bedroom: project.has2Bedroom || false,
          has3Bedroom: project.has3Bedroom || false,
          has4Bedroom: project.has4Bedroom || false,
          has5Bedroom: project.has5Bedroom || false,
          hasCommercial: project.hasCommercial || false,
        },
        createdAt: project.createdAt,
      }),
    );

    return {
      success: true,
      data: {
        projects: projectsWithFeatures,
        count: projectsWithFeatures.length,
        appliedFilters: filters,
      },
    };
  } catch (error) {
    console.error(
      "[SERVER_ACTION] Error filtering projects by features:",
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error filtrando proyectos por características",
    };
  }
}

/**
 * Get feature statistics across all projects
 * Public access for statistics
 */
export async function getFeatureStatisticsAction(): Promise<ProjectFeaturesActionResult> {
  try {
    // Get all public projects for statistics
    const result = await getPublicProjects({ page: 1, pageSize: 1000 });
    if (!result.data) {
      return { success: false, error: result.error };
    }

    const projects = result.data.items;
    const totalProjects = projects.length;

    // Calculate feature counts from projects
    const parkingCount = projects.filter((p: any) => p.hasParking).length;
    const studioCount = projects.filter((p: any) => p.hasStudio).length;
    const bed1Count = projects.filter((p: any) => p.has1Bedroom).length;
    const bed2Count = projects.filter((p: any) => p.has2Bedroom).length;
    const bed3Count = projects.filter((p: any) => p.has3Bedroom).length;
    const bed4Count = projects.filter((p: any) => p.has4Bedroom).length;
    const bed5Count = projects.filter((p: any) => p.has5Bedroom).length;
    const commercialCount = projects.filter((p: any) => p.hasCommercial).length;

    return {
      success: true,
      data: {
        totalProjects,
        featureCounts: {
          parking: parkingCount,
          studio: studioCount,
          oneBedroom: bed1Count,
          twoBedroom: bed2Count,
          threeBedroom: bed3Count,
          fourBedroom: bed4Count,
          fiveBedroom: bed5Count,
          commercial: commercialCount,
        },
        featurePercentages: {
          parking:
            totalProjects > 0
              ? Math.round((parkingCount / totalProjects) * 100)
              : 0,
          studio:
            totalProjects > 0
              ? Math.round((studioCount / totalProjects) * 100)
              : 0,
          oneBedroom:
            totalProjects > 0
              ? Math.round((bed1Count / totalProjects) * 100)
              : 0,
          twoBedroom:
            totalProjects > 0
              ? Math.round((bed2Count / totalProjects) * 100)
              : 0,
          threeBedroom:
            totalProjects > 0
              ? Math.round((bed3Count / totalProjects) * 100)
              : 0,
          fourBedroom:
            totalProjects > 0
              ? Math.round((bed4Count / totalProjects) * 100)
              : 0,
          fiveBedroom:
            totalProjects > 0
              ? Math.round((bed5Count / totalProjects) * 100)
              : 0,
          commercial:
            totalProjects > 0
              ? Math.round((commercialCount / totalProjects) * 100)
              : 0,
        },
      },
    };
  } catch (error) {
    console.error(
      "[SERVER_ACTION] Error calculating feature statistics:",
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error calculando estadísticas de características",
    };
  }
}
