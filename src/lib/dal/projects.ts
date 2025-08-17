// =============================================================================
// PROJECTS DATA ACCESS LAYER
// Database operations for projects and units
// Created: August 2025
// =============================================================================

import {
  getDbClient,
  DatabaseError,
  ValidationError,
  NotFoundError,
  ConflictError,
  logAudit,
  validateUniqueConstraint,
  type Result,
  type PaginatedResult,
  success,
  failure,
  formatPaginatedResult,
  applyPaginationFilter,
  applyTextSearchFilter,
  applyDateRangeFilter
} from './base';
import type {
  Project,
  Unit,
  CreateProjectInput,
  UpdateProjectInput,
  CreateUnitInput,
  UpdateUnitInput,
  ProjectFiltersInput,
  UnitFiltersInput
} from '@/types/database';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  CreateUnitSchema,
  UpdateUnitSchema,
  ProjectFiltersSchema,
  UnitFiltersSchema
} from '@/lib/validations/schemas';

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
    const client = await getDbClient();

    // Build base query
    let query = client
      .from('projects')
      .select(`
        *,
        organization:organizations(*),
        units:units(id, status, unit_type, price)
      `, { count: 'exact' });

    // Apply filters
    if (validFilters.organization_id) {
      query = query.eq('organization_id', validFilters.organization_id);
    }
    
    if (validFilters.status) {
      query = query.eq('status', validFilters.status);
    }
    
    if (validFilters.city) {
      query = query.eq('city', validFilters.city);
    }
    
    if (validFilters.neighborhood) {
      query = query.eq('neighborhood', validFilters.neighborhood);
    }

    if (validFilters.min_price) {
      query = query.gte('base_price', validFilters.min_price);
    }

    if (validFilters.max_price) {
      query = query.lte('base_price', validFilters.max_price);
    }

    // Apply pagination
    query = applyPaginationFilter(query, validFilters.page, validFilters.pageSize);

    // Order by created date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: projects, error, count } = await query;

    if (error) {
      throw new DatabaseError('Error al obtener proyectos', error.code, error);
    }

    const result = formatPaginatedResult(
      projects || [],
      count || 0,
      validFilters.page,
      validFilters.pageSize
    );

    return success(result);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}

/**
 * Get public projects (for non-authenticated users)
 */
export async function getPublicProjects(
  filters: Omit<ProjectFiltersInput, 'organization_id'> = { page: 1, pageSize: 20 }
): Promise<Result<PaginatedResult<Project>>> {
  try {
    const validFilters = ProjectFiltersSchema.omit({ organization_id: true }).parse(filters);
    const client = await getDbClient();

    let query = client
      .from('projects')
      .select(`
        *,
        organization:organizations(name, slug),
        units:units(id, status, unit_type, price, bedrooms, bathrooms)
      `, { count: 'exact' })
      .in('status', ['pre_sale', 'construction']); // Only show active projects

    // Apply filters (same as getProjects but exclude organization_id)
    if (validFilters.status) {
      query = query.eq('status', validFilters.status);
    }
    
    if (validFilters.city) {
      query = query.eq('city', validFilters.city);
    }
    
    if (validFilters.neighborhood) {
      query = query.eq('neighborhood', validFilters.neighborhood);
    }

    if (validFilters.min_price) {
      query = query.gte('base_price', validFilters.min_price);
    }

    if (validFilters.max_price) {
      query = query.lte('base_price', validFilters.max_price);
    }

    query = applyPaginationFilter(query, validFilters.page, validFilters.pageSize);
    query = query.order('created_at', { ascending: false });

    const { data: projects, error, count } = await query;

    if (error) {
      throw new DatabaseError('Error al obtener proyectos públicos', error.code, error);
    }

    const result = formatPaginatedResult(
      projects || [],
      count || 0,
      validFilters.page,
      validFilters.pageSize
    );

    return success(result);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string): Promise<Result<Project>> {
  try {
    const client = await getDbClient();

    const { data: project, error } = await client
      .from('projects')
      .select(`
        *,
        organization:organizations(*),
        units:units(*)
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Proyecto', projectId);
      }
      throw new DatabaseError('Error al obtener proyecto', error.code, error);
    }

    return success(project);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}

/**
 * Get project by slug
 */
export async function getProjectBySlug(
  organizationSlug: string,
  projectSlug: string
): Promise<Result<Project>> {
  try {
    const client = await getDbClient();

    const { data: project, error } = await client
      .from('projects')
      .select(`
        *,
        organization:organizations(*),
        units:units(*)
      `)
      .eq('slug', projectSlug)
      .eq('organizations.slug', organizationSlug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Proyecto');
      }
      throw new DatabaseError('Error al obtener proyecto', error.code, error);
    }

    return success(project);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
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
    const client = await getDbClient();

    // Check if slug is unique within organization
    const isSlugUnique = await validateUniqueConstraint(
      client,
      'projects',
      'slug',
      validInput.slug
    );

    if (!isSlugUnique) {
      throw new ConflictError('Ya existe un proyecto con este slug en la organización');
    }

    // Create project
    const { data: project, error } = await client
      .from('projects')
      .insert({
        ...validInput,
        created_by: userId
      })
      .select(`
        *,
        organization:organizations(*)
      `)
      .single();

    if (error) {
      throw new DatabaseError('Error al crear proyecto', error.code, error);
    }

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: project.organization_id,
      tableName: 'projects',
      recordId: project.id,
      action: 'INSERT',
      newValues: project,
      ipAddress,
      userAgent
    });

    return success(project);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
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
    const client = await getDbClient();

    // Get current project for audit
    const currentResult = await getProjectById(projectId);
    if (!currentResult.data) {
      return failure(currentResult.error || 'Proyecto no encontrado');
    }

    const currentProject = currentResult.data;

    // If slug is being updated, check uniqueness
    if (validInput.slug && validInput.slug !== currentProject.slug) {
      const isSlugUnique = await validateUniqueConstraint(
        client,
        'projects',
        'slug',
        validInput.slug,
        projectId
      );

      if (!isSlugUnique) {
        throw new ConflictError('Ya existe un proyecto con este slug en la organización');
      }
    }

    // Update project
    const { data: project, error } = await client
      .from('projects')
      .update(validInput)
      .eq('id', projectId)
      .select(`
        *,
        organization:organizations(*)
      `)
      .single();

    if (error) {
      throw new DatabaseError('Error al actualizar proyecto', error.code, error);
    }

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: project.organization_id,
      tableName: 'projects',
      recordId: projectId,
      action: 'UPDATE',
      oldValues: currentProject,
      newValues: validInput,
      ipAddress,
      userAgent
    });

    return success(project);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}

// =============================================================================
// UNIT OPERATIONS
// =============================================================================

/**
 * Get units with filters and pagination
 */
export async function getUnits(
  filters: UnitFiltersInput = { page: 1, pageSize: 20 }
): Promise<Result<PaginatedResult<Unit>>> {
  try {
    const validFilters = UnitFiltersSchema.parse(filters);
    const client = await getDbClient();

    let query = client
      .from('units')
      .select(`
        *,
        project:projects(
          *,
          organization:organizations(*)
        )
      `, { count: 'exact' });

    // Apply filters
    if (validFilters.project_id) {
      query = query.eq('project_id', validFilters.project_id);
    }

    if (validFilters.unit_type) {
      query = query.eq('unit_type', validFilters.unit_type);
    }

    if (validFilters.status) {
      query = query.eq('status', validFilters.status);
    }

    if (validFilters.min_bedrooms) {
      query = query.gte('bedrooms', validFilters.min_bedrooms);
    }

    if (validFilters.max_bedrooms) {
      query = query.lte('bedrooms', validFilters.max_bedrooms);
    }

    if (validFilters.min_price) {
      query = query.gte('price', validFilters.min_price);
    }

    if (validFilters.max_price) {
      query = query.lte('price', validFilters.max_price);
    }

    if (validFilters.orientation) {
      query = query.eq('orientation', validFilters.orientation);
    }

    if (validFilters.floor !== undefined) {
      query = query.eq('floor', validFilters.floor);
    }

    query = applyPaginationFilter(query, validFilters.page, validFilters.pageSize);
    query = query.order('unit_number', { ascending: true });

    const { data: units, error, count } = await query;

    if (error) {
      throw new DatabaseError('Error al obtener unidades', error.code, error);
    }

    const result = formatPaginatedResult(
      units || [],
      count || 0,
      validFilters.page,
      validFilters.pageSize
    );

    return success(result);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}

/**
 * Get available units for a project
 */
export async function getAvailableUnits(projectId: string): Promise<Result<Unit[]>> {
  try {
    const client = await getDbClient();

    const { data: units, error } = await client
      .from('units')
      .select(`
        *,
        project:projects(
          *,
          organization:organizations(*)
        )
      `)
      .eq('project_id', projectId)
      .eq('status', 'available')
      .order('unit_number', { ascending: true });

    if (error) {
      throw new DatabaseError('Error al obtener unidades disponibles', error.code, error);
    }

    return success(units || []);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}

/**
 * Get unit by ID
 */
export async function getUnitById(unitId: string): Promise<Result<Unit>> {
  try {
    const client = await getDbClient();

    const { data: unit, error } = await client
      .from('units')
      .select(`
        *,
        project:projects(
          *,
          organization:organizations(*)
        )
      `)
      .eq('id', unitId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Unidad', unitId);
      }
      throw new DatabaseError('Error al obtener unidad', error.code, error);
    }

    return success(unit);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}

/**
 * Create new unit
 */
export async function createUnit(
  input: CreateUnitInput,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Result<Unit>> {
  try {
    const validInput = CreateUnitSchema.parse(input);
    const client = await getDbClient();

    // Check if unit number is unique within project
    const { data: existingUnit } = await client
      .from('units')
      .select('id')
      .eq('project_id', validInput.project_id)
      .eq('unit_number', validInput.unit_number)
      .single();

    if (existingUnit) {
      throw new ConflictError('Ya existe una unidad con este número en el proyecto');
    }

    // Create unit
    const { data: unit, error } = await client
      .from('units')
      .insert({
        ...validInput,
        created_by: userId
      })
      .select(`
        *,
        project:projects(
          *,
          organization:organizations(*)
        )
      `)
      .single();

    if (error) {
      throw new DatabaseError('Error al crear unidad', error.code, error);
    }

    // Update project unit counts
    await updateProjectUnitCounts(client, validInput.project_id);

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: unit.project.organization_id,
      tableName: 'units',
      recordId: unit.id,
      action: 'INSERT',
      newValues: unit,
      ipAddress,
      userAgent
    });

    return success(unit);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
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
  userAgent?: string
): Promise<Result<Unit>> {
  try {
    const validInput = UpdateUnitSchema.parse(input);
    const client = await getDbClient();

    // Get current unit for audit and project info
    const currentResult = await getUnitById(unitId);
    if (!currentResult.data) {
      return failure(currentResult.error || 'Unidad no encontrada');
    }

    const currentUnit = currentResult.data;

    // If unit number is being updated, check uniqueness
    if (validInput.unit_number && validInput.unit_number !== currentUnit.unit_number) {
      const { data: existingUnit } = await client
        .from('units')
        .select('id')
        .eq('project_id', currentUnit.project_id)
        .eq('unit_number', validInput.unit_number)
        .neq('id', unitId)
        .single();

      if (existingUnit) {
        throw new ConflictError('Ya existe una unidad con este número en el proyecto');
      }
    }

    // Update unit
    const { data: unit, error } = await client
      .from('units')
      .update(validInput)
      .eq('id', unitId)
      .select(`
        *,
        project:projects(
          *,
          organization:organizations(*)
        )
      `)
      .single();

    if (error) {
      throw new DatabaseError('Error al actualizar unidad', error.code, error);
    }

    // If status changed, update project unit counts
    if (validInput.status && validInput.status !== currentUnit.status) {
      await updateProjectUnitCounts(client, currentUnit.project_id);
    }

    // Log audit
    await logAudit(client, {
      userId,
      organizationId: unit.project.organization_id,
      tableName: 'units',
      recordId: unitId,
      action: 'UPDATE',
      oldValues: currentUnit,
      newValues: validInput,
      ipAddress,
      userAgent
    });

    return success(unit);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Error desconocido');
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Update project unit counts based on unit statuses
 */
async function updateProjectUnitCounts(client: any, projectId: string): Promise<void> {
  const { data: units, error } = await client
    .from('units')
    .select('status')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error getting units for count update:', error);
    return;
  }

  const totalUnits = units.length;
  const availableUnits = units.filter((u: any) => u.status === 'available').length;

  await client
    .from('projects')
    .update({
      total_units: totalUnits,
      available_units: availableUnits
    })
    .eq('id', projectId);
}