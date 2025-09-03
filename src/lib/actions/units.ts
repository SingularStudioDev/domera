// =============================================================================
// UNITS SERVER ACTIONS
// Server actions for unit management
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import {
  validateSession,
  requireRole,
  validateProjectAccess,
} from '@/lib/auth/validation';
import {
  getUnits,
  getAvailableUnits,
  getUnitById,
  createUnit,
  updateUnit,
  updateUnitsStatus,
  validateUnitsExist,
  validateUnitsAvailability,
  getUnitsWithOrganization,
  getUnitsCountByStatus,
} from '@/lib/dal/units';
import {
  bulkCreateUnitsWithValidation,
  validateUnitNumbersAvailable,
  getBulkCreationSummary,
} from '@/lib/services/units';

// Input types (defined in DAL)
interface UnitFiltersInput {
  page: number;
  pageSize: number;
  projectId?: string;
  unitType?: string;
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
  unitType: string;
  status: UnitStatus;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  price: number;
  orientation?: string;
  balcony: boolean;
  terrace: boolean;
  features: any;
  images: string[];
}

interface UpdateUnitInput {
  unitNumber?: string;
  unitType?: string;
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
import type { UnitStatus } from '@prisma/client';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface UnitActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// =============================================================================
// SERVER ACTIONS FOR UNITS
// =============================================================================

/**
 * Get units with filters and pagination
 * Requires organization access for the project
 */
export async function getUnitsAction(
  filters: UnitFiltersInput = { page: 1, pageSize: 20 }
): Promise<UnitActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // If filtering by project, validate project access
    if (filters.projectId) {
      const projectAccessResult = await validateProjectAccess(
        filters.projectId
      );
      if (!projectAccessResult.success) {
        return { success: false, error: projectAccessResult.error };
      }
    }

    // Get units
    const result = await getUnits(filters);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Transform Decimal fields to numbers for client serialization
    const transformedData = {
      ...result.data,
      data: result.data.data.map(unit => {
        // Cast to any to handle the dynamic include types
        const unitWithProject = unit as any;
        
        return {
          ...unit,
          totalArea: unit.totalArea ? Number(unit.totalArea) : null,
          builtArea: unit.builtArea ? Number(unit.builtArea) : null,
          price: Number(unit.price),
          // Transform project data if it exists (due to include)
          ...(unitWithProject.project && {
            project: {
              ...unitWithProject.project,
              basePrice: unitWithProject.project.basePrice ? Number(unitWithProject.project.basePrice) : null,
              latitude: unitWithProject.project.latitude ? Number(unitWithProject.project.latitude) : null,
              longitude: unitWithProject.project.longitude ? Number(unitWithProject.project.longitude) : null,
            }
          })
        };
      })
    };

    return { success: true, data: transformedData };
  } catch (error) {
    console.error('[SERVER_ACTION] Error getting units:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Error obteniendo unidades',
    };
  }
}

/**
 * Get available units for a project
 * Public access for browsing
 */
export async function getAvailableUnitsAction(
  projectId: string
): Promise<UnitActionResult> {
  try {
    const result = await getAvailableUnits(projectId);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Transform Decimal fields to numbers for client serialization
    const transformedUnits = result.data.map(unit => {
      // Cast to any to handle the dynamic include types
      const unitWithProject = unit as any;
      
      return {
        ...unit,
        totalArea: unit.totalArea ? Number(unit.totalArea) : null,
        builtArea: unit.builtArea ? Number(unit.builtArea) : null,
        price: Number(unit.price),
        // Transform project data if it exists (due to include)
        ...(unitWithProject.project && {
          project: {
            ...unitWithProject.project,
            basePrice: unitWithProject.project.basePrice ? Number(unitWithProject.project.basePrice) : null,
            latitude: unitWithProject.project.latitude ? Number(unitWithProject.project.latitude) : null,
            longitude: unitWithProject.project.longitude ? Number(unitWithProject.project.longitude) : null,
          }
        })
      };
    });

    return { success: true, data: transformedUnits };
  } catch (error) {
    console.error('[SERVER_ACTION] Error getting available units:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error obteniendo unidades disponibles',
    };
  }
}

/**
 * Get available units for a project excluding units already in checkout
 * Public access for checkout process
 */
export async function getAvailableUnitsForCheckoutAction(
  projectId: string,
  excludeUnitIds: string[] = []
): Promise<UnitActionResult> {
  try {
    const result = await getAvailableUnits(projectId);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Filter out units already in checkout
    const filteredUnits = result.data.filter(unit => !excludeUnitIds.includes(unit.id));

    // Transform Decimal fields to numbers for client serialization
    const transformedUnits = filteredUnits.map(unit => {
      // Cast to any to handle the dynamic include types
      const unitWithProject = unit as any;
      
      return {
        ...unit,
        totalArea: unit.totalArea ? Number(unit.totalArea) : null,
        builtArea: unit.builtArea ? Number(unit.builtArea) : null,
        price: Number(unit.price),
        // Transform project data if it exists (due to include)
        ...(unitWithProject.project && {
          project: {
            ...unitWithProject.project,
            basePrice: unitWithProject.project.basePrice ? Number(unitWithProject.project.basePrice) : null,
            latitude: unitWithProject.project.latitude ? Number(unitWithProject.project.latitude) : null,
            longitude: unitWithProject.project.longitude ? Number(unitWithProject.project.longitude) : null,
          }
        })
      };
    });

    return { success: true, data: transformedUnits };
  } catch (error) {
    console.error('[SERVER_ACTION] Error getting available units for checkout:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error obteniendo unidades disponibles para checkout',
    };
  }
}

/**
 * Get unit by ID
 * Public access for browsing
 */
export async function getUnitByIdAction(
  unitId: string
): Promise<UnitActionResult> {
  try {
    const result = await getUnitById(unitId);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    const unit = result.data;
    // Cast to any to handle the dynamic include types
    const unitWithProject = unit as any;
    
    // Transform Decimal fields to numbers for client serialization
    const transformedUnit = {
      ...unit,
      totalArea: unit.totalArea ? Number(unit.totalArea) : null,
      builtArea: unit.builtArea ? Number(unit.builtArea) : null,
      price: Number(unit.price),
      // Transform project data if it exists (due to include)
      ...(unitWithProject.project && {
        project: {
          ...unitWithProject.project,
          basePrice: unitWithProject.project.basePrice ? Number(unitWithProject.project.basePrice) : null,
          latitude: unitWithProject.project.latitude ? Number(unitWithProject.project.latitude) : null,
          longitude: unitWithProject.project.longitude ? Number(unitWithProject.project.longitude) : null,
        }
      })
    };

    return { success: true, data: transformedUnit };
  } catch (error) {
    console.error('[SERVER_ACTION] Error getting unit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo unidad',
    };
  }
}

/**
 * Create new unit
 * Requires organization access and appropriate role
 */
export async function createUnitAction(
  input: CreateUnitInput,
  ipAddress?: string,
  userAgent?: string
): Promise<UnitActionResult> {
  try {
    // Validate project access
    const projectAccessResult = await validateProjectAccess(input.projectId);
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
      ['admin', 'organization_owner', 'sales_manager'].includes(role.role)
    );

    if (!hasPermission) {
      return {
        success: false,
        error: 'No tienes permisos para crear unidades',
      };
    }

    // Create unit
    const result = await createUnit(input, user.id, ipAddress, userAgent);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath('/projects');
    revalidatePath(`/projects/${input.projectId}`);
    revalidatePath('/dashboard');

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[SERVER_ACTION] Error creating unit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error creando unidad',
    };
  }
}

/**
 * Update unit
 * Requires organization access and appropriate role
 */
export async function updateUnitAction(
  unitId: string,
  input: UpdateUnitInput,
  ipAddress?: string,
  userAgent?: string
): Promise<UnitActionResult> {
  try {
    // Get unit to validate project access
    const unitResult = await getUnitById(unitId);
    if (!unitResult.data) {
      return { success: false, error: unitResult.error };
    }

    const unit = unitResult.data;

    // Validate project access
    const projectAccessResult = await validateProjectAccess(unit.projectId);
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
      ['admin', 'organization_owner', 'sales_manager'].includes(role.role)
    );

    if (!hasPermission) {
      return {
        success: false,
        error: 'No tienes permisos para actualizar unidades',
      };
    }

    // Update unit
    const result = await updateUnit(
      unitId,
      input,
      user.id,
      ipAddress,
      userAgent
    );
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath('/projects');
    revalidatePath(`/projects/${unit.projectId}`);
    revalidatePath(`/units/${unitId}`);
    revalidatePath('/dashboard');

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[SERVER_ACTION] Error updating unit:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Error actualizando unidad',
    };
  }
}

/**
 * Update multiple units status
 * Requires organization access and appropriate role
 */
export async function updateUnitsStatusAction(
  unitIds: string[],
  status: UnitStatus,
  ipAddress?: string,
  userAgent?: string
): Promise<UnitActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;

    // Get units with organization info to validate access
    const unitsResult = await getUnitsWithOrganization(unitIds);
    if (!unitsResult.data) {
      return { success: false, error: unitsResult.error };
    }

    const units = unitsResult.data;

    // Check if all units belong to same organization and user has access
    const organizationIds = [...new Set(units.map((u) => u.organizationId))];
    if (organizationIds.length > 1) {
      return {
        success: false,
        error: 'Todas las unidades deben pertenecer a la misma organización',
      };
    }

    const organizationId = organizationIds[0];
    const hasAccess = user.userRoles.some(
      (role) =>
        role.role === 'admin' ||
        (role.organizationId === organizationId &&
          ['organization_owner', 'sales_manager'].includes(role.role))
    );

    if (!hasAccess) {
      return {
        success: false,
        error: 'No tienes acceso a esta organización',
      };
    }

    // Update units status
    const result = await updateUnitsStatus(
      unitIds,
      status,
      user.id,
      ipAddress,
      userAgent
    );
    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath('/projects');
    revalidatePath('/dashboard');

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[SERVER_ACTION] Error updating units status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error actualizando estado de unidades',
    };
  }
}

// =============================================================================
// VALIDATION ACTIONS
// =============================================================================

/**
 * Validate units exist
 * Used by operations before creating reservations
 */
export async function validateUnitsExistAction(
  unitIds: string[]
): Promise<UnitActionResult> {
  try {
    const result = await validateUnitsExist(unitIds);
    return { success: result.data || false, error: result.error };
  } catch (error) {
    console.error('[SERVER_ACTION] Error validating units exist:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error validando existencia de unidades',
    };
  }
}

/**
 * Validate units are available
 * Used by operations before creating reservations
 */
export async function validateUnitsAvailabilityAction(
  unitIds: string[]
): Promise<UnitActionResult> {
  try {
    const result = await validateUnitsAvailability(unitIds);
    return { success: result.data || false, error: result.error };
  } catch (error) {
    console.error(
      '[SERVER_ACTION] Error validating units availability:',
      error
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error validando disponibilidad de unidades',
    };
  }
}

/**
 * Get units with organization info
 * Used by operations service layer
 */
export async function getUnitsWithOrganizationAction(
  unitIds: string[]
): Promise<UnitActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const result = await getUnitsWithOrganization(unitIds);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error(
      '[SERVER_ACTION] Error getting units with organization:',
      error
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error obteniendo unidades con organización',
    };
  }
}

// =============================================================================
// STATISTICS ACTIONS
// =============================================================================

/**
 * Get units count by status for a project
 * Requires project access
 */
export async function getUnitsCountByStatusAction(
  projectId: string
): Promise<UnitActionResult> {
  try {
    // Validate project access
    const projectAccessResult = await validateProjectAccess(projectId);
    if (!projectAccessResult.success) {
      return { success: false, error: projectAccessResult.error };
    }

    const result = await getUnitsCountByStatus(projectId);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error(
      '[SERVER_ACTION] Error getting units count by status:',
      error
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error obteniendo conteo de unidades',
    };
  }
}

// =============================================================================
// BULK OPERATIONS
// =============================================================================

/**
 * Create multiple units for a project (bulk creation)
 * Requires project access and appropriate role
 * Highly optimized for performance with comprehensive validation
 */
export async function bulkCreateUnitsAction(
  projectId: string,
  units: Array<{
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
    currency?: string;
    description?: string;
    features?: string[];
    images?: string[];
    floor_plan_url?: string;
    dimensions?: string;
  }>,
  ipAddress?: string,
  userAgent?: string
): Promise<UnitActionResult> {
  try {
    // Validate project access first
    const projectAccessResult = await validateProjectAccess(projectId);
    if (!projectAccessResult.success) {
      return { success: false, error: projectAccessResult.error };
    }

    // Check if user has appropriate role for bulk operations
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const hasPermission = user.userRoles.some((role) =>
      ['admin', 'organization_owner', 'sales_manager'].includes(role.role)
    );

    if (!hasPermission) {
      return {
        success: false,
        error:
          'No tienes permisos para crear unidades en lote. Se requiere rol de administrador, propietario de organización o gerente de ventas.',
      };
    }

    // Additional validation for large batches
    if (
      units.length > 200 &&
      !user.userRoles.some((role) => role.role === 'admin')
    ) {
      return {
        success: false,
        error:
          'Batches de más de 200 unidades requieren permisos de administrador',
      };
    }

    // Normalize and validate input data
    const normalizedUnits = units.map((unit) => ({
      ...unit,
      currency: unit.currency || 'USD',
      features: unit.features || [],
      images: unit.images || [],
    }));

    // Use service layer for bulk creation with comprehensive validation
    const result = await bulkCreateUnitsWithValidation(
      projectId,
      normalizedUnits,
      user.id,
      ipAddress,
      userAgent
    );

    if (!result.data) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/dashboard');
    revalidatePath(`/projects/${projectId}/units`);

    return {
      success: true,
      data: {
        ...result.data,
        message: `Éxito: ${result.data.count} unidades creadas en lote`,
        performance: {
          unitsCreated: result.data.count,
          processingTime: 'Completado eficientemente',
        },
      },
    };
  } catch (error) {
    console.error('[SERVER_ACTION] Error in bulk create units:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error crítico en creación de unidades en lote',
    };
  }
}

/**
 * Validate unit numbers are available before bulk creation
 * Public helper for frontend validation
 */
export async function validateBulkUnitNumbersAction(
  projectId: string,
  unitNumbers: string[]
): Promise<UnitActionResult> {
  try {
    // Validate project access
    const projectAccessResult = await validateProjectAccess(projectId);
    if (!projectAccessResult.success) {
      return { success: false, error: projectAccessResult.error };
    }

    // Validate unit numbers availability
    const result = await validateUnitNumbersAvailable(projectId, unitNumbers);

    return {
      success: result.data || false,
      data: {
        available: result.data || false,
        message: result.data
          ? `Todos los ${unitNumbers.length} números de unidad están disponibles`
          : result.error,
      },
      error: result.error,
    };
  } catch (error) {
    console.error('[SERVER_ACTION] Error validating bulk unit numbers:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error validando números de unidad',
    };
  }
}

/**
 * Get bulk creation summary for a project
 * Requires project access
 */
export async function getBulkCreationSummaryAction(
  projectId: string,
  daysBack: number = 7
): Promise<UnitActionResult> {
  try {
    // Validate project access
    const projectAccessResult = await validateProjectAccess(projectId);
    if (!projectAccessResult.success) {
      return { success: false, error: projectAccessResult.error };
    }

    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const result = await getBulkCreationSummary(projectId, user.id, since);
    if (!result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error(
      '[SERVER_ACTION] Error getting bulk creation summary:',
      error
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error obteniendo resumen de creación en lote',
    };
  }
}
