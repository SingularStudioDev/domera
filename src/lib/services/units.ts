// =============================================================================
// UNITS SERVICE LAYER
// Service layer coordinating bulk unit operations across multiple DALs
// Handles complex business logic spanning multiple models
// =============================================================================

import {
  getDbClient,
  logAudit,
  success,
  failure,
  type Result,
  type DatabaseClient
} from '@/lib/dal/base';
import { validateUnitsExist } from '@/lib/dal/units';
import { getProjectById } from '@/lib/dal/projects';
import { BulkCreateUnitsSchema } from '@/lib/validations/schemas';
import type { Unit } from '@prisma/client';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface BulkUnitValidationError {
  index: number;
  unitNumber?: string;
  field: string;
  message: string;
}

interface BulkUnitCreationResult {
  created: Unit[];
  count: number;
  summary: string;
}

interface CreateUnitInput {
  unit_number: string;
  floor?: number;
  unit_type: string;
  bedrooms: number;
  bathrooms: number;
  total_area?: number;
  built_area?: number;
  orientation?: string;
  facing?: string;
  price: number;
  currency: string;
  description?: string;
  features: string[];
  images: string[];
  floor_plan_url?: string;
  dimensions?: string;
}

// =============================================================================
// BULK UNIT CREATION SERVICE
// =============================================================================

/**
 * Create multiple units for a project with comprehensive validation
 * Handles all business logic and cross-DAL coordination
 */
export async function bulkCreateUnitsWithValidation(
  projectId: string,
  units: CreateUnitInput[],
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Result<BulkUnitCreationResult>> {
  try {
    const client = getDbClient();

    // =========================================================================
    // PHASE 1: COMPREHENSIVE PRE-VALIDATION
    // =========================================================================
    
    // 1.1 Validate input schema (includes duplicate check within batch)
    const validationResult = BulkCreateUnitsSchema.safeParse({
      project_id: projectId,
      units
    });

    if (!validationResult.success) {
      const errors: BulkUnitValidationError[] = validationResult.error.issues.map((issue, index) => ({
        index: issue.path.length > 1 ? parseInt(issue.path[1] as string) : 0,
        unitNumber: issue.path.length > 2 && typeof issue.path[2] === 'string' ? 
          units[parseInt(issue.path[1] as string)]?.unit_number : undefined,
        field: issue.path[issue.path.length - 1] as string,
        message: issue.message
      }));

      return failure(`Errores de validación en ${errors.length} unidades: ${errors.map(e => e.message).join(', ')}`);
    }

    // 1.2 Verify project exists and get details
    const projectResult = await getProjectById(projectId);
    if (!projectResult.data) {
      return failure(projectResult.error || 'Proyecto no encontrado');
    }

    const project = projectResult.data;

    // 1.3 Check for existing unit numbers in the project (single query)
    const unitNumbers = units.map(u => u.unit_number);
    const existingUnits = await client.unit.findMany({
      where: {
        projectId,
        unitNumber: { in: unitNumbers }
      },
      select: { unitNumber: true }
    });

    if (existingUnits.length > 0) {
      const duplicateNumbers = existingUnits.map(u => u.unitNumber);
      return failure(
        `Los siguientes números de unidad ya existen en el proyecto: ${duplicateNumbers.join(', ')}`
      );
    }

    // 1.4 Business rule validations
    const businessValidationErrors: BulkUnitValidationError[] = [];
    
    units.forEach((unit, index) => {
      // Validate garage floors (negative) have appropriate unit types
      if (unit.floor !== undefined && unit.floor < 0) {
        if (!['garage', 'cochera', 'deposito', 'storage'].includes(unit.unit_type.toLowerCase())) {
          businessValidationErrors.push({
            index,
            unitNumber: unit.unit_number,
            field: 'unit_type',
            message: `Unidad en piso ${unit.floor} (subsuelo) debe ser tipo garage, cochera, depósito o storage`
          });
        }
      }

      // Validate bedroom/bathroom logic
      if (unit.bedrooms > 0 && unit.bathrooms === 0) {
        businessValidationErrors.push({
          index,
          unitNumber: unit.unit_number,
          field: 'bathrooms',
          message: 'Unidades con dormitorios deben tener al menos 1 baño'
        });
      }

      // Validate price is reasonable (basic sanity check)
      if (unit.price < 1000) { // Minimum $1,000 USD
        businessValidationErrors.push({
          index,
          unitNumber: unit.unit_number,
          field: 'price',
          message: 'Precio muy bajo (mínimo $1,000 USD)'
        });
      }

      if (unit.price > 10000000) { // Maximum $10M USD
        businessValidationErrors.push({
          index,
          unitNumber: unit.unit_number,
          field: 'price',
          message: 'Precio muy alto (máximo $10,000,000 USD)'
        });
      }
    });

    if (businessValidationErrors.length > 0) {
      return failure(`Errores de reglas de negocio en ${businessValidationErrors.length} unidades`);
    }

    // =========================================================================
    // PHASE 2: EFFICIENT BULK CREATION TRANSACTION
    // =========================================================================

    const result = await client.$transaction(async (tx) => {
      // 2.1 Prepare unit data for bulk creation
      const unitsData = units.map(unit => ({
        projectId,
        unitNumber: unit.unit_number,
        floor: unit.floor,
        unitType: unit.unit_type,
        status: 'available' as const,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        area: unit.total_area,
        builtArea: unit.built_area,
        orientation: unit.orientation,
        facing: unit.facing,
        price: unit.price,
        currency: unit.currency || 'USD',
        description: unit.description,
        features: unit.features,
        images: unit.images,
        floorPlanUrl: unit.floor_plan_url,
        dimensions: unit.dimensions,
        balcony: false, // Default values
        terrace: false,
        createdBy: userId,
        organizationId: project.organizationId
      }));

      // 2.2 Bulk create units (single database operation)
      const createResult = await tx.unit.createMany({
        data: unitsData,
        skipDuplicates: true // Extra safety
      });

      // 2.3 Fetch created units for return data
      const createdUnits = await tx.unit.findMany({
        where: {
          projectId,
          unitNumber: { in: unitNumbers },
          createdBy: userId // Ensure we only get units created in this transaction
        },
        include: {
          project: {
            select: { name: true }
          }
        },
        orderBy: { unitNumber: 'asc' }
      });

      // 2.4 Bulk create audit log entries (single operation)
      const auditEntries = createdUnits.map(unit => ({
        userId,
        organizationId: project.organizationId,
        tableName: 'units',
        recordId: unit.id,
        action: 'INSERT' as const,
        newValues: unit,
        ipAddress,
        userAgent
      }));

      if (auditEntries.length > 0) {
        await tx.auditLog.createMany({
          data: auditEntries
        });
      }

      // 2.5 Update project unit counts
      await tx.project.update({
        where: { id: projectId },
        data: {
          totalUnits: { increment: createResult.count },
          availableUnits: { increment: createResult.count }
        }
      });

      return {
        created: createdUnits,
        count: createResult.count,
        summary: `Creadas ${createResult.count} unidades exitosamente en el proyecto ${project.name}`
      };
    });

    return success(result);

  } catch (error) {
    console.error('[SERVICE] Error in bulk create units:', error);
    return failure(
      error instanceof Error 
        ? error.message 
        : 'Error interno creando unidades en lote'
    );
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validate unit numbers don't conflict with existing units in project
 */
export async function validateUnitNumbersAvailable(
  projectId: string,
  unitNumbers: string[]
): Promise<Result<boolean>> {
  try {
    const client = getDbClient();
    
    const existingCount = await client.unit.count({
      where: {
        projectId,
        unitNumber: { in: unitNumbers }
      }
    });

    if (existingCount > 0) {
      return failure(`${existingCount} números de unidad ya existen en el proyecto`);
    }

    return success(true);
  } catch (error) {
    return failure(
      error instanceof Error 
        ? error.message 
        : 'Error validando números de unidad'
    );
  }
}

/**
 * Get bulk creation progress/status (for potential future use)
 */
export async function getBulkCreationSummary(
  projectId: string,
  createdBy: string,
  since: Date
): Promise<Result<{
  totalCreated: number;
  recentBatches: Array<{
    date: Date;
    count: number;
    unitNumbers: string[];
  }>;
}>> {
  try {
    const client = getDbClient();

    const recentUnits = await client.unit.findMany({
      where: {
        projectId,
        createdBy,
        createdAt: { gte: since }
      },
      select: {
        unitNumber: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by creation time (within same minute = same batch)
    const batches: { [key: string]: string[] } = {};
    recentUnits.forEach(unit => {
      const batchKey = unit.createdAt.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
      if (!batches[batchKey]) {
        batches[batchKey] = [];
      }
      batches[batchKey].push(unit.unitNumber);
    });

    const recentBatches = Object.entries(batches).map(([dateStr, unitNumbers]) => ({
      date: new Date(dateStr),
      count: unitNumbers.length,
      unitNumbers
    }));

    return success({
      totalCreated: recentUnits.length,
      recentBatches
    });

  } catch (error) {
    return failure(
      error instanceof Error 
        ? error.message 
        : 'Error obteniendo resumen de creación'
    );
  }
}