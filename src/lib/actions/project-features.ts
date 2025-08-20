// =============================================================================
// PROJECT FEATURES SERVER ACTIONS FOR DOMERA PLATFORM
// Business logic for managing project feature flags and filtering
// Created: August 2025
// =============================================================================

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ProjectFeaturesResult {
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
  roomTypes?: ('studio' | '1bed' | '2bed' | '3bed' | '4bed' | '5bed')[];
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
export async function updateProjectFeatures(
  projectId: string,
  features: Partial<ProjectFeatures>
): Promise<ProjectFeaturesResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Check if user has permission to update project features
    const hasPermission = session.user.roles.some(role => 
      ['admin', 'organization_owner', 'sales_manager'].includes(role.role)
    );

    if (!hasPermission) {
      return {
        success: false,
        error: 'No tienes permisos para actualizar características de proyectos'
      };
    }

    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        // If not admin, check organization access
        ...(session.user.roles.some(r => r.role === 'admin') ? {} : {
          organizationId: { 
            in: session.user.roles.map(r => r.organizationId).filter(Boolean) 
          }
        })
      }
    });

    if (!project) {
      return {
        success: false,
        error: 'Proyecto no encontrado o sin permisos de acceso'
      };
    }

    // Update project features
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...features,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        hasParking: true,
        hasStudio: true,
        has1Bedroom: true,
        has2Bedroom: true,
        has3Bedroom: true,
        has4Bedroom: true,
        has5Bedroom: true,
        hasCommercial: true
      }
    });

    revalidatePath('/projects');
    revalidatePath(`/projects/${project.slug}`);
    revalidatePath('/admin');

    return {
      success: true,
      data: {
        message: `Características actualizadas para ${project.name}`,
        project: updatedProject
      }
    };

  } catch (error) {
    console.error('Error updating project features:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

/**
 * Get project features for a specific project
 */
export async function getProjectFeatures(projectId: string): Promise<ProjectFeaturesResult> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        hasParking: true,
        hasStudio: true,
        has1Bedroom: true,
        has2Bedroom: true,
        has3Bedroom: true,
        has4Bedroom: true,
        has5Bedroom: true,
        hasCommercial: true
      }
    });

    if (!project) {
      return {
        success: false,
        error: 'Proyecto no encontrado'
      };
    }

    const features: ProjectFeatures = {
      hasParking: project.hasParking,
      hasStudio: project.hasStudio,
      has1Bedroom: project.has1Bedroom,
      has2Bedroom: project.has2Bedroom,
      has3Bedroom: project.has3Bedroom,
      has4Bedroom: project.has4Bedroom,
      has5Bedroom: project.has5Bedroom,
      hasCommercial: project.hasCommercial
    };

    return {
      success: true,
      data: {
        projectId: project.id,
        projectName: project.name,
        features
      }
    };

  } catch (error) {
    console.error('Error fetching project features:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

/**
 * Get all projects with their features
 */
export async function getProjectsWithFeatures(): Promise<ProjectFeaturesResult> {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        address: true,
        neighborhood: true,
        city: true,
        status: true,
        basePrice: true,
        currency: true,
        totalUnits: true,
        availableUnits: true,
        images: true,
        amenities: true,
        hasParking: true,
        hasStudio: true,
        has1Bedroom: true,
        has2Bedroom: true,
        has3Bedroom: true,
        has4Bedroom: true,
        has5Bedroom: true,
        hasCommercial: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const projectsWithFeatures: ProjectWithFeatures[] = projects.map(project => ({
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
      totalUnits: project.totalUnits,
      availableUnits: project.availableUnits,
      images: Array.isArray(project.images) ? project.images : JSON.parse(project.images as string || '[]'),
      amenities: Array.isArray(project.amenities) ? project.amenities : JSON.parse(project.amenities as string || '[]'),
      features: {
        hasParking: project.hasParking,
        hasStudio: project.hasStudio,
        has1Bedroom: project.has1Bedroom,
        has2Bedroom: project.has2Bedroom,
        has3Bedroom: project.has3Bedroom,
        has4Bedroom: project.has4Bedroom,
        has5Bedroom: project.has5Bedroom,
        hasCommercial: project.hasCommercial
      },
      createdAt: project.createdAt
    }));

    return {
      success: true,
      data: projectsWithFeatures
    };

  } catch (error) {
    console.error('Error fetching projects with features:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

/**
 * Filter projects by features
 */
export async function getProjectsByFeatures(filters: FeatureFilters): Promise<ProjectFeaturesResult> {
  try {
    // Build dynamic where conditions based on filters
    const whereConditions: any = {};

    // Parking filter
    if (filters.parking !== undefined) {
      whereConditions.hasParking = filters.parking;
    }

    // Commercial filter
    if (filters.commercial !== undefined) {
      whereConditions.hasCommercial = filters.commercial;
    }

    // Room types filter - if any room types are specified, at least one must be true
    if (filters.roomTypes && filters.roomTypes.length > 0) {
      const roomTypeConditions = [];
      
      filters.roomTypes.forEach(roomType => {
        switch (roomType) {
          case 'studio':
            roomTypeConditions.push({ hasStudio: true });
            break;
          case '1bed':
            roomTypeConditions.push({ has1Bedroom: true });
            break;
          case '2bed':
            roomTypeConditions.push({ has2Bedroom: true });
            break;
          case '3bed':
            roomTypeConditions.push({ has3Bedroom: true });
            break;
          case '4bed':
            roomTypeConditions.push({ has4Bedroom: true });
            break;
          case '5bed':
            roomTypeConditions.push({ has5Bedroom: true });
            break;
        }
      });

      if (roomTypeConditions.length > 0) {
        whereConditions.OR = roomTypeConditions;
      }
    }

    const projects = await prisma.project.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        address: true,
        neighborhood: true,
        city: true,
        status: true,
        basePrice: true,
        currency: true,
        totalUnits: true,
        availableUnits: true,
        images: true,
        amenities: true,
        hasParking: true,
        hasStudio: true,
        has1Bedroom: true,
        has2Bedroom: true,
        has3Bedroom: true,
        has4Bedroom: true,
        has5Bedroom: true,
        hasCommercial: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const projectsWithFeatures: ProjectWithFeatures[] = projects.map(project => ({
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
      totalUnits: project.totalUnits,
      availableUnits: project.availableUnits,
      images: Array.isArray(project.images) ? project.images : JSON.parse(project.images as string || '[]'),
      amenities: Array.isArray(project.amenities) ? project.amenities : JSON.parse(project.amenities as string || '[]'),
      features: {
        hasParking: project.hasParking,
        hasStudio: project.hasStudio,
        has1Bedroom: project.has1Bedroom,
        has2Bedroom: project.has2Bedroom,
        has3Bedroom: project.has3Bedroom,
        has4Bedroom: project.has4Bedroom,
        has5Bedroom: project.has5Bedroom,
        hasCommercial: project.hasCommercial
      },
      createdAt: project.createdAt
    }));

    return {
      success: true,
      data: {
        projects: projectsWithFeatures,
        count: projectsWithFeatures.length,
        appliedFilters: filters
      }
    };

  } catch (error) {
    console.error('Error filtering projects by features:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

/**
 * Get feature statistics across all projects
 */
export async function getFeatureStatistics(): Promise<ProjectFeaturesResult> {
  try {
    const stats = await prisma.project.aggregate({
      _count: {
        id: true
      }
    });

    const featureStats = await prisma.project.groupBy({
      by: ['hasParking', 'hasStudio', 'has1Bedroom', 'has2Bedroom', 'has3Bedroom', 'has4Bedroom', 'has5Bedroom', 'hasCommercial'],
      _count: { id: true }
    });

    // Calculate feature counts
    const parkingCount = await prisma.project.count({ where: { hasParking: true } });
    const studioCount = await prisma.project.count({ where: { hasStudio: true } });
    const bed1Count = await prisma.project.count({ where: { has1Bedroom: true } });
    const bed2Count = await prisma.project.count({ where: { has2Bedroom: true } });
    const bed3Count = await prisma.project.count({ where: { has3Bedroom: true } });
    const bed4Count = await prisma.project.count({ where: { has4Bedroom: true } });
    const bed5Count = await prisma.project.count({ where: { has5Bedroom: true } });
    const commercialCount = await prisma.project.count({ where: { hasCommercial: true } });

    const totalProjects = stats._count.id;

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
          commercial: commercialCount
        },
        featurePercentages: {
          parking: totalProjects > 0 ? Math.round((parkingCount / totalProjects) * 100) : 0,
          studio: totalProjects > 0 ? Math.round((studioCount / totalProjects) * 100) : 0,
          oneBedroom: totalProjects > 0 ? Math.round((bed1Count / totalProjects) * 100) : 0,
          twoBedroom: totalProjects > 0 ? Math.round((bed2Count / totalProjects) * 100) : 0,
          threeBedroom: totalProjects > 0 ? Math.round((bed3Count / totalProjects) * 100) : 0,
          fourBedroom: totalProjects > 0 ? Math.round((bed4Count / totalProjects) * 100) : 0,
          fiveBedroom: totalProjects > 0 ? Math.round((bed5Count / totalProjects) * 100) : 0,
          commercial: totalProjects > 0 ? Math.round((commercialCount / totalProjects) * 100) : 0
        }
      }
    };

  } catch (error) {
    console.error('Error calculating feature statistics:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}