// =============================================================================
// PROJECTS SERVER ACTIONS FOR DOMERA PLATFORM
// Complete CRUD operations for projects and units management
// Backend-focused: Simple, secure, well-documented interfaces for frontend
// =============================================================================

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { ProjectStatus, UnitStatus, UnitType } from '@prisma/client';

// =============================================================================
// TYPES AND INTERFACES FOR FRONTEND INTEGRATION
// =============================================================================

interface ProjectResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  address: string;
  neighborhood?: string;
  city: string;
  status: ProjectStatus;
  basePrice?: number;
  currency: string;
  totalUnits: number;
  availableUnits: number;
  images: string[];
  amenities: string[];
  startDate?: Date;
  estimatedCompletion?: Date;
  features: {
    hasParking: boolean;
    hasStudio: boolean;
    has1Bedroom: boolean;
    has2Bedroom: boolean;
    has3Bedroom: boolean;
    has4Bedroom: boolean;
    has5Bedroom: boolean;
    hasCommercial: boolean;
  };
  createdAt: Date;
}

export interface Unit {
  id: string;
  projectId: string;
  unitNumber: string;
  floor?: number;
  unitType: UnitType;
  status: UnitStatus;
  bedrooms: number;
  bathrooms: number;
  totalArea?: number;
  builtArea?: number;
  orientation?: string;
  facing?: string;
  price: number;
  currency: string;
  description?: string;
  features: string[];
  images: string[];
  floorPlanUrl?: string;
  dimensions?: string;
  project?: {
    id: string;
    name: string;
    slug: string;
    address: string;
  };
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  city?: string;
  neighborhood?: string;
  priceRange?: { min?: number; max?: number };
  features?: {
    parking?: boolean;
    roomTypes?: string[];
    commercial?: boolean;
  };
  search?: string;
}

export interface UnitFilters {
  projectId?: string;
  status?: UnitStatus[];
  unitType?: UnitType[];
  bedrooms?: number[];
  priceRange?: { min?: number; max?: number };
  floor?: number[];
  search?: string;
}

// =============================================================================
// PROJECTS CRUD OPERATIONS
// =============================================================================

/**
 * Get all projects with optional filtering
 * Simple interface for frontend - no complex queries needed
 */
export async function getProjects(
  filters?: ProjectFilters
): Promise<ProjectResult> {
  try {
    // Build dynamic where conditions
    const whereConditions: any = {};

    if (filters?.status && filters.status.length > 0) {
      whereConditions.status = { in: filters.status };
    }

    if (filters?.city) {
      whereConditions.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters?.neighborhood) {
      whereConditions.neighborhood = {
        contains: filters.neighborhood,
        mode: 'insensitive',
      };
    }

    if (filters?.priceRange) {
      const priceConditions: any = {};
      if (filters.priceRange.min !== undefined) {
        priceConditions.gte = filters.priceRange.min;
      }
      if (filters.priceRange.max !== undefined) {
        priceConditions.lte = filters.priceRange.max;
      }
      if (Object.keys(priceConditions).length > 0) {
        whereConditions.basePrice = priceConditions;
      }
    }

    if (filters?.search) {
      whereConditions.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Feature filters
    if (filters?.features) {
      if (filters.features.parking !== undefined) {
        whereConditions.hasParking = filters.features.parking;
      }
      if (filters.features.commercial !== undefined) {
        whereConditions.hasCommercial = filters.features.commercial;
      }
      if (filters.features.roomTypes && filters.features.roomTypes.length > 0) {
        const roomTypeConditions = [];
        filters.features.roomTypes.forEach((roomType) => {
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
          whereConditions.OR = [
            ...(whereConditions.OR || []),
            ...roomTypeConditions,
          ];
        }
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
        startDate: true,
        estimatedCompletion: true,
        hasParking: true,
        hasStudio: true,
        has1Bedroom: true,
        has2Bedroom: true,
        has3Bedroom: true,
        has4Bedroom: true,
        has5Bedroom: true,
        hasCommercial: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform data for frontend consumption
    const transformedProjects: Project[] = projects.map((project) => ({
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
      images: Array.isArray(project.images)
        ? project.images
        : JSON.parse((project.images as string) || '[]'),
      amenities: Array.isArray(project.amenities)
        ? project.amenities
        : JSON.parse((project.amenities as string) || '[]'),
      startDate: project.startDate,
      estimatedCompletion: project.estimatedCompletion,
      features: {
        hasParking: project.hasParking,
        hasStudio: project.hasStudio,
        has1Bedroom: project.has1Bedroom,
        has2Bedroom: project.has2Bedroom,
        has3Bedroom: project.has3Bedroom,
        has4Bedroom: project.has4Bedroom,
        has5Bedroom: project.has5Bedroom,
        hasCommercial: project.hasCommercial,
      },
      createdAt: project.createdAt,
    }));

    return {
      success: true,
      data: {
        projects: transformedProjects,
        count: transformedProjects.length,
        filters: filters,
      },
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Get a single project by ID or slug
 */
export async function getProject(identifier: string): Promise<ProjectResult> {
  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        address: true,
        neighborhood: true,
        city: true,
        latitude: true,
        longitude: true,
        status: true,
        basePrice: true,
        currency: true,
        totalUnits: true,
        availableUnits: true,
        images: true,
        amenities: true,
        startDate: true,
        estimatedCompletion: true,
        actualCompletion: true,
        legalRegime: true,
        masterPlanFiles: true,
        progressUpdates: true,
        hasParking: true,
        hasStudio: true,
        has1Bedroom: true,
        has2Bedroom: true,
        has3Bedroom: true,
        has4Bedroom: true,
        has5Bedroom: true,
        hasCommercial: true,
        createdAt: true,
        organization: {
          select: {
            name: true,
            email: true,
            phone: true,
            logoUrl: true,
            websiteUrl: true,
          },
        },
      },
    });

    if (!project) {
      return {
        success: false,
        error: 'Proyecto no encontrado',
      };
    }

    // Transform data for frontend
    const transformedProject = {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      shortDescription: project.shortDescription,
      address: project.address,
      neighborhood: project.neighborhood,
      city: project.city,
      latitude: project.latitude ? Number(project.latitude) : undefined,
      longitude: project.longitude ? Number(project.longitude) : undefined,
      status: project.status,
      basePrice: project.basePrice ? Number(project.basePrice) : undefined,
      currency: project.currency,
      totalUnits: project.totalUnits,
      availableUnits: project.availableUnits,
      images: Array.isArray(project.images)
        ? project.images
        : JSON.parse((project.images as string) || '[]'),
      amenities: Array.isArray(project.amenities)
        ? project.amenities
        : JSON.parse((project.amenities as string) || '[]'),
      startDate: project.startDate,
      estimatedCompletion: project.estimatedCompletion,
      actualCompletion: project.actualCompletion,
      legalRegime: project.legalRegime,
      masterPlanFiles: Array.isArray(project.masterPlanFiles)
        ? project.masterPlanFiles
        : JSON.parse((project.masterPlanFiles as string) || '[]'),
      progressUpdates: Array.isArray(project.progressUpdates)
        ? project.progressUpdates
        : JSON.parse((project.progressUpdates as string) || '[]'),
      features: {
        hasParking: project.hasParking,
        hasStudio: project.hasStudio,
        has1Bedroom: project.has1Bedroom,
        has2Bedroom: project.has2Bedroom,
        has3Bedroom: project.has3Bedroom,
        has4Bedroom: project.has4Bedroom,
        has5Bedroom: project.has5Bedroom,
        hasCommercial: project.hasCommercial,
      },
      organization: project.organization,
      createdAt: project.createdAt,
    };

    return {
      success: true,
      data: transformedProject,
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

// =============================================================================
// UNITS CRUD OPERATIONS
// =============================================================================

/**
 * Get units with optional filtering
 * Simple interface for frontend unit listings
 */
export async function getUnits(filters?: UnitFilters): Promise<ProjectResult> {
  try {
    // Build dynamic where conditions
    const whereConditions: any = {};

    if (filters?.projectId) {
      whereConditions.projectId = filters.projectId;
    }

    if (filters?.status && filters.status.length > 0) {
      whereConditions.status = { in: filters.status };
    }

    if (filters?.unitType && filters.unitType.length > 0) {
      whereConditions.unitType = { in: filters.unitType };
    }

    if (filters?.bedrooms && filters.bedrooms.length > 0) {
      whereConditions.bedrooms = { in: filters.bedrooms };
    }

    if (filters?.floor && filters.floor.length > 0) {
      whereConditions.floor = { in: filters.floor };
    }

    if (filters?.priceRange) {
      const priceConditions: any = {};
      if (filters.priceRange.min !== undefined) {
        priceConditions.gte = filters.priceRange.min;
      }
      if (filters.priceRange.max !== undefined) {
        priceConditions.lte = filters.priceRange.max;
      }
      if (Object.keys(priceConditions).length > 0) {
        whereConditions.price = priceConditions;
      }
    }

    if (filters?.search) {
      whereConditions.OR = [
        { unitNumber: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const units = await prisma.unit.findMany({
      where: whereConditions,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            neighborhood: true,
          },
        },
      },
      orderBy: [{ project: { name: 'asc' } }, { unitNumber: 'asc' }],
    });

    // Transform data for frontend consumption
    const transformedUnits: Unit[] = units.map((unit) => ({
      id: unit.id,
      projectId: unit.projectId,
      unitNumber: unit.unitNumber,
      floor: unit.floor,
      unitType: unit.unitType,
      status: unit.status,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      totalArea: unit.totalArea ? Number(unit.totalArea) : undefined,
      builtArea: unit.builtArea ? Number(unit.builtArea) : undefined,
      orientation: unit.orientation,
      facing: unit.facing,
      price: Number(unit.price),
      currency: unit.currency,
      description: unit.description,
      features: Array.isArray(unit.features)
        ? unit.features
        : JSON.parse((unit.features as string) || '[]'),
      images: Array.isArray(unit.images)
        ? unit.images
        : JSON.parse((unit.images as string) || '[]'),
      floorPlanUrl: unit.floorPlanUrl,
      dimensions: unit.dimensions,
      project: unit.project,
    }));

    return {
      success: true,
      data: {
        units: transformedUnits,
        count: transformedUnits.length,
        filters: filters,
      },
    };
  } catch (error) {
    console.error('Error fetching units:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Get a single unit by ID
 */
export async function getUnit(unitId: string): Promise<ProjectResult> {
  try {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            neighborhood: true,
            city: true,
            status: true,
            amenities: true,
            images: true,
            organization: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!unit) {
      return {
        success: false,
        error: 'Unidad no encontrada',
      };
    }

    // Transform data for frontend
    const transformedUnit = {
      id: unit.id,
      projectId: unit.projectId,
      unitNumber: unit.unitNumber,
      floor: unit.floor,
      unitType: unit.unitType,
      status: unit.status,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      totalArea: unit.totalArea ? Number(unit.totalArea) : undefined,
      builtArea: unit.builtArea ? Number(unit.builtArea) : undefined,
      orientation: unit.orientation,
      facing: unit.facing,
      price: Number(unit.price),
      currency: unit.currency,
      description: unit.description,
      features: Array.isArray(unit.features)
        ? unit.features
        : JSON.parse((unit.features as string) || '[]'),
      images: Array.isArray(unit.images)
        ? unit.images
        : JSON.parse((unit.images as string) || '[]'),
      floorPlanUrl: unit.floorPlanUrl,
      dimensions: unit.dimensions,
      project: {
        ...unit.project,
        amenities: Array.isArray(unit.project.amenities)
          ? unit.project.amenities
          : JSON.parse((unit.project.amenities as string) || '[]'),
        images: Array.isArray(unit.project.images)
          ? unit.project.images
          : JSON.parse((unit.project.images as string) || '[]'),
      },
    };

    return {
      success: true,
      data: transformedUnit,
    };
  } catch (error) {
    console.error('Error fetching unit:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Get units for a specific project
 * Convenience function for project detail pages
 */
export async function getProjectUnits(
  projectId: string,
  filters?: Omit<UnitFilters, 'projectId'>
): Promise<ProjectResult> {
  return getUnits({ ...filters, projectId });
}

// =============================================================================
// SUMMARY AND STATISTICS
// =============================================================================

/**
 * Get project statistics for dashboards
 */
export async function getProjectStatistics(): Promise<ProjectResult> {
  try {
    const [
      totalProjects,
      totalUnits,
      availableUnits,
      projectsByStatus,
      unitsByType,
      priceStats,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.unit.count(),
      prisma.unit.count({ where: { status: 'available' } }),
      prisma.project.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.unit.groupBy({
        by: ['unitType'],
        _count: { id: true },
      }),
      prisma.unit.aggregate({
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    return {
      success: true,
      data: {
        totals: {
          projects: totalProjects,
          units: totalUnits,
          availableUnits: availableUnits,
          occupancyRate:
            totalUnits > 0
              ? Math.round(((totalUnits - availableUnits) / totalUnits) * 100)
              : 0,
        },
        projectsByStatus: projectsByStatus.map((item) => ({
          status: item.status,
          count: item._count.id,
        })),
        unitsByType: unitsByType.map((item) => ({
          type: item.unitType,
          count: item._count.id,
        })),
        priceStats: {
          average: priceStats._avg.price ? Number(priceStats._avg.price) : 0,
          minimum: priceStats._min.price ? Number(priceStats._min.price) : 0,
          maximum: priceStats._max.price ? Number(priceStats._max.price) : 0,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching project statistics:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}
