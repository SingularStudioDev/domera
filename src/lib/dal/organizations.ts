// =============================================================================
// ORGANIZATIONS DATA ACCESS LAYER
// Database operations for organizations management
// Following single responsibility principle - only organization-related operations
// =============================================================================

import type { Organization, OrganizationStatus } from "@prisma/client";

import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
} from "@/lib/validations/schemas";

import {
  buildPaginationOptions,
  ConflictError,
  DatabaseError,
  failure,
  formatPaginatedResult,
  getDbClient,
  logAudit,
  NotFoundError,
  success,
  ValidationError,
  type PaginatedResult,
  type Result,
} from "./base";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

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
// ORGANIZATION VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate that organization exists
 */
export async function validateOrganizationExists(
  organizationId: string,
): Promise<Result<boolean>> {
  try {
    const client = getDbClient();

    const organization = await client.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    // implicit convert to boolean and return (true or false)
    return success(!!organization);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Check if organization slug is unique
 */
export async function isSlugUnique(
  slug: string,
  excludeId?: string,
): Promise<Result<boolean>> {
  try {
    const client = getDbClient();

    const where: any = { slug };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const organization = await client.organization.findFirst({ where });

    // convert boolean and negates (slug exists -> returns false)
    return success(!organization);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

// =============================================================================
// ORGANIZATION CRUD OPERATIONS
// =============================================================================

/**
 * Get all organizations with filters and pagination
 */
export async function getOrganizations(
  filters: OrganizationFiltersInput = { page: 1, pageSize: 20 },
): Promise<Result<PaginatedResult<Organization>>> {
  try {
    const client = getDbClient();

    // Build where clause
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const totalCount = await client.organization.count({ where });

    // Apply pagination
    const paginationOptions = buildPaginationOptions(
      filters.page,
      filters.pageSize,
    );

    // Get organizations
    const organizations = await client.organization.findMany({
      where,
      orderBy: {
        name: "asc",
      },
      ...paginationOptions,
    });

    const result = formatPaginatedResult(
      organizations,
      totalCount,
      filters.page,
      filters.pageSize,
    );

    return success(result);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(
  organizationId: string,
): Promise<Result<Organization>> {
  try {
    const client = getDbClient();

    const organization = await client.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundError("Organización", organizationId);
    }

    return success(organization);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(
  slug: string,
): Promise<Result<Organization>> {
  try {
    const client = getDbClient();

    const organization = await client.organization.findUnique({
      where: { slug },
    });

    if (!organization) {
      throw new NotFoundError("Organización con slug", slug);
    }

    return success(organization);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Create new organization
 */
export async function createOrganization(
  input: CreateOrganizationInput,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<Organization>> {
  try {
    const validInput = CreateOrganizationSchema.parse(input);
    const client = getDbClient();

    // Check if slug is unique
    const slugResult = await isSlugUnique(validInput.slug);
    if (!slugResult.data && slugResult.error) {
      return failure(slugResult.error);
    }
    if (!slugResult.data) {
      throw new ConflictError("Ya existe una organización con este slug");
    }

    // Create organization
    const organization = await client.organization.create({
      data: {
        ...validInput,
        createdBy: userId,
      },
    });

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: organization.id,
      tableName: "organizations",
      recordId: organization.id,
      action: "INSERT",
      newValues: organization,
      ipAddress,
      userAgent,
    });

    return success(organization);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Update organization
 */
export async function updateOrganization(
  organizationId: string,
  input: UpdateOrganizationInput,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<Organization>> {
  try {
    const validInput = UpdateOrganizationSchema.parse(input);
    const client = getDbClient();

    // Get current organization for audit
    const currentResult = await getOrganizationById(organizationId);
    if (!currentResult.data) {
      return failure(currentResult.error || "Organización no encontrada");
    }

    const currentOrganization = currentResult.data;

    // If slug is being updated, check uniqueness
    if (validInput.slug && validInput.slug !== currentOrganization.slug) {
      const slugResult = await isSlugUnique(validInput.slug, organizationId);
      if (!slugResult.data && slugResult.error) {
        return failure(slugResult.error);
      }
      if (!slugResult.data) {
        throw new ConflictError("Ya existe una organización con este slug");
      }
    }

    // Update organization
    const organization = await client.organization.update({
      where: { id: organizationId },
      data: {
        ...validInput,
        updatedBy: userId,
      },
    });

    // Log audit
    await logAudit(client, {
      userId,
      organizationId,
      tableName: "organizations",
      recordId: organizationId,
      action: "UPDATE",
      oldValues: currentOrganization,
      newValues: validInput,
      ipAddress,
      userAgent,
    });

    return success(organization);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get organization statistics
 */
export async function getOrganizationStats(organizationId: string): Promise<
  Result<{
    totalProjects: number;
    activeProjects: number;
    totalUnits: number;
    soldUnits: number;
    totalRevenue: number;
    totalMembers: number;
  }>
> {
  try {
    const client = getDbClient();

    // Get projects count
    const projects = await client.project.findMany({
      where: { organizationId },
      select: {
        status: true,
        units: {
          select: {
            status: true,
            price: true,
          },
        },
      },
    });

    // Get members count
    const membersCount = await client.userRole.count({
      where: {
        organizationId,
        isActive: true,
      },
    });

    // Calculate statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      (p) => p.status === "pre_sale" || p.status === "construction",
    ).length;

    let totalUnits = 0;
    let soldUnits = 0;
    let totalRevenue = 0;

    projects.forEach((project) => {
      totalUnits += project.units.length;
      project.units.forEach((unit) => {
        if (unit.status === "sold") {
          soldUnits++;
          totalRevenue += unit.price.toNumber();
        }
      });
    });

    const stats = {
      totalProjects,
      activeProjects,
      totalUnits,
      soldUnits,
      totalRevenue,
      totalMembers: membersCount,
    };

    return success(stats);
  } catch (error) {
    return failure(
      error instanceof Error
        ? error.message
        : "Error obteniendo estadísticas de la organización",
    );
  }
}

/**
 * Get organizations that user has access to
 */
export async function getUserOrganizations(
  userId: string,
): Promise<Result<Organization[]>> {
  try {
    const client = getDbClient();

    const userRoles = await client.userRole.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        organization: true,
      },
    });

    const organizations = userRoles
      .filter((role) => role.organization)
      .map((role) => role.organization!);

    return success(organizations);
  } catch (error) {
    return failure(
      error instanceof Error
        ? error.message
        : "Error obteniendo organizaciones del usuario",
    );
  }
}

/**
 * Check if user belongs to organization
 */
export async function userBelongsToOrganization(
  userId: string,
  organizationId: string,
): Promise<Result<boolean>> {
  try {
    const client = getDbClient();

    const userRole = await client.userRole.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
      },
    });

    return success(!!userRole);
  } catch (error) {
    return failure(
      error instanceof Error
        ? error.message
        : "Error verificando membresía de organización",
    );
  }
}
