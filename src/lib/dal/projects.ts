// =============================================================================
// PROJECTS DATA ACCESS LAYER
// Database operations for projects
// =============================================================================

import {
  getDbClient,
  DatabaseError,
  ValidationError,
  NotFoundError,
  ConflictError,
  logAudit,
  type Result,
  type PaginatedResult,
  success,
  failure,
  formatPaginatedResult,
  buildPaginationOptions,
  buildTextSearchFilter,
  buildDateRangeFilter,
} from './base';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectFiltersSchema,
} from '@/lib/validations/schemas';
import type { Project, ProjectStatus } from '@prisma/client';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ProjectFiltersInput {
  page: number;
  pageSize: number;
  organizationId?: string;
  status?: ProjectStatus;
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
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
  status: ProjectStatus;
  basePrice?: number;
  currency: string;
  images: string[];
  amenities: string[];
  startDate?: Date;
  estimatedCompletion?: Date;
}

interface UpdateProjectInput {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  status?: ProjectStatus;
  basePrice?: number;
  currency?: string;
  images?: string[];
  amenities?: string[];
  startDate?: Date;
  estimatedCompletion?: Date;
}

// =============================================================================
// PROJECT OPERATIONS
// =============================================================================

/**
 * Get all projects with filters and pagination
 */
export async function getProjects(
  filters: ProjectFiltersInput = { page: 1, pageSize: 20 }
): Promise<Result<PaginatedResult<Project>>> {
  try {
    const validFilters = ProjectFiltersSchema.parse(filters);
    const client = getDbClient();

    // Build where clause
    const where: any = {};

    if (validFilters.organizationId) {
      where.organizationId = validFilters.organizationId;
    }

    if (validFilters.status) {
      where.status = validFilters.status;
    }

    if (validFilters.city) {
      where.city = validFilters.city;
    }

    if (validFilters.neighborhood) {
      where.neighborhood = validFilters.neighborhood;
    }

    if (validFilters.minPrice || validFilters.maxPrice) {
      where.basePrice = {};
      if (validFilters.minPrice) where.basePrice.gte = validFilters.minPrice;
      if (validFilters.maxPrice) where.basePrice.lte = validFilters.maxPrice;
    }

    // Get total count
    const totalCount = await client.project.count({ where });

    // Apply pagination
    const paginationOptions = buildPaginationOptions(
      validFilters.page,
      validFilters.pageSize
    );

    // Get projects with relations
    const projects = await client.project.findMany({
      where,
      include: {
        organization: true,
        units: {
          select: {
            id: true,
            status: true,
            unitType: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...paginationOptions,
    });

    const result = formatPaginatedResult(
      projects,
      totalCount,
      validFilters.page,
      validFilters.pageSize
    );

    return success(result);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

/**
 * Get public projects (for non-authenticated users)
 */
export async function getPublicProjects(
  filters: Omit<ProjectFiltersInput, 'organizationId'> = {
    page: 1,
    pageSize: 20,
  }
): Promise<Result<PaginatedResult<Project>>> {
  try {
    const validFilters = ProjectFiltersSchema.omit({
      organizationId: true,
    }).parse(filters);
    const client = getDbClient();

    // Build where clause - only show active projects
    const where: any = {
      status: {
        in: ['pre_sale', 'construction'],
      },
    };

    if (validFilters.status) {
      where.status = validFilters.status;
    }

    if (validFilters.city) {
      where.city = validFilters.city;
    }

    if (validFilters.neighborhood) {
      where.neighborhood = validFilters.neighborhood;
    }

    if (validFilters.minPrice || validFilters.maxPrice) {
      where.basePrice = {};
      if (validFilters.minPrice) where.basePrice.gte = validFilters.minPrice;
      if (validFilters.maxPrice) where.basePrice.lte = validFilters.maxPrice;
    }

    // Get total count
    const totalCount = await client.project.count({ where });

    // Apply pagination
    const paginationOptions = buildPaginationOptions(
      validFilters.page,
      validFilters.pageSize
    );

    // Get public projects with limited organization info
    const projects = await client.project.findMany({
      where,
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
        units: {
          select: {
            id: true,
            status: true,
            unitType: true,
            price: true,
            bedrooms: true,
            bathrooms: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...paginationOptions,
    });

    const result = formatPaginatedResult(
      projects,
      totalCount,
      validFilters.page,
      validFilters.pageSize
    );

    return success(result);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

/**
 * Get project by ID
 */
export async function getProjectById(
  projectId: string
): Promise<Result<Project>> {
  try {
    const client = getDbClient();

    const project = await client.project.findUnique({
      where: { id: projectId },
      include: {
        organization: true,
        units: true,
      },
    });

    if (!project) {
      throw new NotFoundError('Proyecto', projectId);
    }

    return success(project);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

/**
 * Get project by slug
 */
export async function getProjectBySlug(
  projectSlug: string
): Promise<Result<Project>> {
  try {
    const client = getDbClient();

    const project = await client.project.findFirst({
      where: {
        slug: projectSlug,

      },
      include: {
        organization: true,
        units: true,
      },
    });

    if (!project) {
      throw new NotFoundError('Proyecto');
    }

    return success(project);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

/**
 * Create new project
 */
export async function createProject(
  input: CreateProjectInput,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Result<Project>> {
  try {
    const validInput = CreateProjectSchema.parse(input);
    const client = getDbClient();

    // Check if slug is unique within organization
    const existingProject = await client.project.findFirst({
      where: {
        slug: validInput.slug,
        organizationId: validInput.organizationId,
      },
    });

    if (existingProject) {
      throw new ConflictError(
        'Ya existe un proyecto con este slug en la organización'
      );
    }

    // Create project
    const project = await client.project.create({
      data: {
        ...validInput,
        createdBy: userId,
      },
      include: {
        organization: true,
      },
    });

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: project.organizationId,
      tableName: 'projects',
      recordId: project.id,
      action: 'INSERT',
      newValues: project,
      ipAddress,
      userAgent,
    });

    return success(project);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Result<Project>> {
  try {
    const validInput = UpdateProjectSchema.parse(input);
    const client = getDbClient();

    // Get current project for audit
    const currentResult = await getProjectById(projectId);
    if (!currentResult.data) {
      return failure(currentResult.error || 'Proyecto no encontrado');
    }

    const currentProject = currentResult.data;

    // If slug is being updated, check uniqueness
    if (validInput.slug && validInput.slug !== currentProject.slug) {
      const existingProject = await client.project.findFirst({
        where: {
          slug: validInput.slug,
          organizationId: currentProject.organizationId,
          NOT: {
            id: projectId,
          },
        },
      });

      if (existingProject) {
        throw new ConflictError(
          'Ya existe un proyecto con este slug en la organización'
        );
      }
    }

    // Update project
    const project = await client.project.update({
      where: { id: projectId },
      data: {
        ...validInput,
        updatedBy: userId,
      },
      include: {
        organization: true,
      },
    });

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: project.organizationId,
      tableName: 'projects',
      recordId: projectId,
      action: 'UPDATE',
      oldValues: currentProject,
      newValues: validInput,
      ipAddress,
      userAgent,
    });

    return success(project);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Update project unit counts based on unit statuses
 * NOTE: This function coordinates with units DAL to get unit counts
 */
export async function updateProjectUnitCounts(
  projectId: string
): Promise<Result<boolean>> {
  try {
    const client = getDbClient();

    const units = await client.unit.findMany({
      where: { projectId },
      select: { status: true },
    });

    const totalUnits = units.length;
    const availableUnits = units.filter((u) => u.status === 'available').length;

    await client.project.update({
      where: { id: projectId },
      data: {
        totalUnits,
        availableUnits,
      },
    });

    return success(true);
  } catch (error) {
    console.error('Error updating project unit counts:', error);
    return failure(
      error instanceof Error
        ? error.message
        : 'Error actualizando conteos de unidades'
    );
  }
}

/**
 * Get project statistics for a specific project
 */
export async function getProjectStats(projectId: string): Promise<
  Result<{
    totalUnits: number;
    availableUnits: number;
    soldUnits: number;
    reservedUnits: number;
    totalRevenue: number;
  }>
> {
  try {
    const client = getDbClient();

    const units = await client.unit.findMany({
      where: { projectId },
      select: {
        status: true,
        price: true,
      },
    });

    const stats = {
      totalUnits: units.length,
      availableUnits: units.filter((u) => u.status === 'available').length,
      soldUnits: units.filter((u) => u.status === 'sold').length,
      reservedUnits: units.filter((u) => u.status === 'reserved').length,
      totalRevenue: units
        .filter((u) => u.status === 'sold')
        .reduce((sum, unit) => sum + unit.price.toNumber(), 0),
    };

    return success(stats);
  } catch (error) {
    return failure(
      error instanceof Error
        ? error.message
        : 'Error obteniendo estadísticas del proyecto'
    );
  }
}
