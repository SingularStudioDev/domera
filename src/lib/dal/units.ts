// =============================================================================
// UNITS DATA ACCESS LAYER
// Database operations for unit management
// Following single responsibility principle - only unit-related operations
// =============================================================================

import type { Unit, UnitStatus, UnitType } from "@prisma/client";

import {
  CreateUnitSchema,
  UnitFiltersSchema,
  UpdateUnitSchema,
} from "@/lib/validations/schemas";

import {
  buildDateRangeFilter,
  buildPaginationOptions,
  buildTextSearchFilter,
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

interface UnitFiltersInput {
  page: number;
  pageSize: number;
  projectId?: string;
  unitType?: UnitType;
  status?: UnitStatus;
  minBedrooms?: number;
  maxBedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  orientation?: string;
  floor?: number;
}

interface CreateUnitInput {
  projectId: string;
  unitNumber: string;
  unitType: UnitType;
  status: UnitStatus;
  floor?: number;
  bedrooms: number;
  bathrooms: number;
  totalArea?: number;
  builtArea?: number;
  area?: number; // Legacy field, can be derived from totalArea
  price: number;
  currency?: string;
  orientation?: string;
  facing?: string;
  description?: string;
  dimensions?: string;
  floorPlanUrl?: string;
  balcony?: boolean;
  terrace?: boolean;
  features: any;
  images: string[];
}

interface UpdateUnitInput {
  unitNumber?: string;
  unitType?: UnitType;
  status?: UnitStatus;
  floor?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  price?: number;
  orientation?: string;
  balcony?: boolean;
  terrace?: boolean;
  features?: any;
  images?: string[];
}

// =============================================================================
// UNIT VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate that units exist and return basic info
 */
export async function validateUnitsExist(
  unitIds: string[],
): Promise<Result<boolean>> {
  try {
    const client = getDbClient();

    const count = await client.unit.count({
      where: {
        id: { in: unitIds },
      },
    });

    if (count !== unitIds.length) {
      throw new NotFoundError("Algunas unidades no existen");
    }

    return success(true);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Validate that units are available for reservation
 */
export async function validateUnitsAvailability(
  unitIds: string[],
): Promise<Result<boolean>> {
  try {
    const client = getDbClient();

    const units = await client.unit.findMany({
      where: {
        id: { in: unitIds },
      },
      select: {
        id: true,
        status: true,
        unitNumber: true,
      },
    });

    if (units.length !== unitIds.length) {
      throw new NotFoundError("Algunas unidades no existen");
    }

    const unavailableUnits = units.filter(
      (unit) => unit.status !== "available",
    );
    if (unavailableUnits.length > 0) {
      const unitNumbers = unavailableUnits.map((u) => u.unitNumber).join(", ");
      throw new ConflictError(
        `Las siguientes unidades no están disponibles: ${unitNumbers}`,
      );
    }

    return success(true);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Get basic unit information with project organization
 */
export async function getUnitsWithOrganization(unitIds: string[]): Promise<
  Result<
    {
      id: string;
      projectId: string;
      organizationId: string;
      price: number;
    }[]
  >
> {
  try {
    const client = getDbClient();

    const units = await client.unit.findMany({
      where: {
        id: { in: unitIds },
      },
      select: {
        id: true,
        projectId: true,
        price: true,
        project: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (units.length === 0) {
      throw new NotFoundError("Unidades no encontradas");
    }

    const result = units.map((unit) => ({
      id: unit.id,
      projectId: unit.projectId,
      organizationId: unit.project.organizationId,
      price: unit.price.toNumber(),
    }));

    return success(result);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Update multiple units status
 */
export async function updateUnitsStatus(
  unitIds: string[],
  status: UnitStatus,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<boolean>> {
  try {
    const client = getDbClient();

    await client.unit.updateMany({
      where: {
        id: { in: unitIds },
      },
      data: {
        status,
        updatedBy: userId,
      },
    });

    // Log audit for each unit
    for (const unitId of unitIds) {
      await logAudit(client, {
        userId,
        tableName: "units",
        recordId: unitId,
        action: "UPDATE",
        newValues: { status },
        ipAddress,
        userAgent,
      });
    }

    return success(true);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

// =============================================================================
// UNIT CRUD OPERATIONS
// =============================================================================

/**
 * Get units with filters and pagination
 */
export async function getUnits(
  filters: UnitFiltersInput = { page: 1, pageSize: 20 },
): Promise<Result<PaginatedResult<Unit>>> {
  try {
    const validFilters = UnitFiltersSchema.parse(filters);
    const client = getDbClient();

    // Build where clause
    const where: any = {};

    if (validFilters.projectId) {
      where.projectId = validFilters.projectId;
    }

    if (validFilters.unitType) {
      where.unitType = validFilters.unitType;
    }

    if (validFilters.status) {
      where.status = validFilters.status;
    }

    if (validFilters.minBedrooms || validFilters.maxBedrooms) {
      where.bedrooms = {};
      if (validFilters.minBedrooms)
        where.bedrooms.gte = validFilters.minBedrooms;
      if (validFilters.maxBedrooms)
        where.bedrooms.lte = validFilters.maxBedrooms;
    }

    if (validFilters.minPrice || validFilters.maxPrice) {
      where.price = {};
      if (validFilters.minPrice) where.price.gte = validFilters.minPrice;
      if (validFilters.maxPrice) where.price.lte = validFilters.maxPrice;
    }

    if (validFilters.orientation) {
      where.orientation = validFilters.orientation;
    }

    if (validFilters.floor !== undefined) {
      where.floor = validFilters.floor;
    }

    // Get total count
    const totalCount = await client.unit.count({ where });

    // Apply pagination
    const paginationOptions = buildPaginationOptions(
      validFilters.page,
      validFilters.pageSize,
    );

    // Get units with project info
    const units = await client.unit.findMany({
      where,
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
      orderBy: {
        unitNumber: "asc",
      },
      ...paginationOptions,
    });

    const result = formatPaginatedResult(
      units,
      totalCount,
      validFilters.page,
      validFilters.pageSize,
    );

    return success(result);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Get available units for a project
 */
export async function getAvailableUnits(
  projectId: string,
): Promise<Result<Unit[]>> {
  try {
    const client = getDbClient();

    const units = await client.unit.findMany({
      where: {
        projectId,
        status: "available",
      },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
      orderBy: {
        unitNumber: "asc",
      },
    });

    return success(units);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Get unit by ID
 */
export async function getUnitById(unitId: string): Promise<Result<Unit>> {
  try {
    const client = getDbClient();

    const unit = await client.unit.findUnique({
      where: { id: unitId },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundError("Unidad", unitId);
    }

    // Serialize Decimal fields to numbers for client compatibility
    const serializedUnit = {
      ...unit,
      totalArea: unit.totalArea ? unit.totalArea.toNumber() : null,
      builtArea: unit.builtArea ? unit.builtArea.toNumber() : null,
      price: unit.price.toNumber(),
      // Serialize project decimals if project is included
      ...(unit.project && {
        project: {
          ...unit.project,
          latitude: unit.project.latitude
            ? unit.project.latitude.toNumber()
            : null,
          longitude: unit.project.longitude
            ? unit.project.longitude.toNumber()
            : null,
          basePrice: unit.project.basePrice
            ? unit.project.basePrice.toNumber()
            : null,
        },
      }),
    } as any; // Cast to any since we're transforming the type

    return success(serializedUnit);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Create new unit
 */
export async function createUnit(
  input: CreateUnitInput,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<Unit>> {
  try {
    // Input is already validated by the server action
    const client = getDbClient();

    // Check if unit number is unique within project
    const existingUnit = await client.unit.findFirst({
      where: {
        projectId: input.projectId,
        unitNumber: input.unitNumber,
      },
    });

    if (existingUnit) {
      throw new ConflictError(
        "Ya existe una unidad con este número en el proyecto",
      );
    }

    // Create unit
    const unit = await client.unit.create({
      data: {
        projectId: input.projectId,
        unitNumber: input.unitNumber,
        floor: input.floor || null,
        unitType: input.unitType,
        status: input.status,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        totalArea: input.totalArea || input.area || null,
        builtArea: input.builtArea || null,
        orientation: input.orientation || null,
        facing: input.facing || null,
        price: input.price,
        currency: input.currency || "USD",
        description: input.description || null,
        dimensions: input.dimensions || null,
        floorPlanUrl: input.floorPlanUrl || null,
        features: input.features,
        images: input.images,
        createdBy: userId,
      },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: unit.project.organizationId,
      tableName: "units",
      recordId: unit.id,
      action: "INSERT",
      newValues: unit,
      ipAddress,
      userAgent,
    });

    return success(unit);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Update unit
 */
export async function updateUnit(
  unitId: string,
  input: UpdateUnitInput,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<Unit>> {
  try {
    const validInput = UpdateUnitSchema.parse(input);
    const client = getDbClient();

    // Get current unit for audit and project info
    const currentResult = await getUnitById(unitId);
    if (!currentResult.data) {
      return failure(currentResult.error || "Unidad no encontrada");
    }

    const currentUnit = currentResult.data;

    // If unit number is being updated, check uniqueness
    if (
      validInput.unitNumber &&
      validInput.unitNumber !== currentUnit.unitNumber
    ) {
      const existingUnit = await client.unit.findFirst({
        where: {
          projectId: currentUnit.projectId,
          unitNumber: validInput.unitNumber,
          NOT: {
            id: unitId,
          },
        },
      });

      if (existingUnit) {
        throw new ConflictError(
          "Ya existe una unidad con este número en el proyecto",
        );
      }
    }

    // Update unit
    const unit = await client.unit.update({
      where: { id: unitId },
      data: {
        ...validInput,
        updatedBy: userId,
      },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: unit.project.organizationId,
      tableName: "units",
      recordId: unitId,
      action: "UPDATE",
      oldValues: currentUnit,
      newValues: validInput,
      ipAddress,
      userAgent,
    });

    return success(unit);
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
 * Get units count by status for a project
 */
export async function getUnitsCountByStatus(projectId: string): Promise<
  Result<{
    total: number;
    available: number;
    sold: number;
    reserved: number;
    in_process: number;
  }>
> {
  try {
    const client = getDbClient();

    const units = await client.unit.findMany({
      where: { projectId },
      select: { status: true },
    });

    const counts = {
      total: units.length,
      available: units.filter((u) => u.status === "available").length,
      sold: units.filter((u) => u.status === "sold").length,
      reserved: units.filter((u) => u.status === "reserved").length,
      in_process: units.filter((u) => u.status === "in_process").length,
    };

    return success(counts);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}
