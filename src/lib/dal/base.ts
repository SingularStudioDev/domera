// =============================================================================
// BASE DATA ACCESS LAYER FOR DOMERA PLATFORM
// Core functions and utilities for database operations
// Created: August 2025
// =============================================================================

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// BASE DATABASE CLIENT
// =============================================================================

export type DatabaseClient = SupabaseClient<Database>;

/**
 * Get authenticated Supabase client
 */
export async function getDbClient(): Promise<DatabaseClient> {
  return createClient();
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'No tienes permisos para realizar esta acción') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` con ID ${id}` : ''} no encontrado`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

// =============================================================================
// RESULT WRAPPER
// =============================================================================

export type Result<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: string;
};

export function success<T>(data: T): Result<T> {
  return { data, error: null };
}

export function failure<T>(error: string): Result<T> {
  return { data: null, error };
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

export async function logAudit(
  client: DatabaseClient,
  {
    userId,
    organizationId,
    tableName,
    recordId,
    action,
    oldValues,
    newValues,
    ipAddress,
    userAgent
  }: {
    userId?: string;
    organizationId?: string;
    tableName: string;
    recordId: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  try {
    await client
      .from('audit_logs')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        table_name: tableName,
        record_id: recordId,
        action,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ipAddress,
        user_agent: userAgent
      });
  } catch (error) {
    // Log audit errors but don't fail the main operation
    console.error('Failed to log audit:', error);
  }
}

// =============================================================================
// PAGINATION HELPERS
// =============================================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function calculatePagination(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function formatPaginatedResult<T>(
  data: T[],
  count: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  return {
    data,
    count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize)
  };
}

// =============================================================================
// PERMISSION CHECKING
// =============================================================================

export async function getCurrentUser(client: DatabaseClient) {
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    throw new AuthorizationError('Usuario no autenticado');
  }
  return user;
}

export async function getUserWithRoles(client: DatabaseClient, email: string) {
  const { data: user, error } = await client
    .from('users')
    .select(`
      *,
      user_roles!inner(
        role,
        organization_id,
        is_active,
        organizations(name, slug)
      )
    `)
    .eq('email', email)
    .eq('user_roles.is_active', true)
    .single();

  if (error) {
    throw new DatabaseError('Error al obtener usuario', error.code, error);
  }

  return user;
}

export async function checkUserPermission(
  client: DatabaseClient,
  userId: string,
  requiredRole: string,
  organizationId?: string
): Promise<boolean> {
  const { data, error } = await client
    .from('user_roles')
    .select('role, organization_id')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    throw new DatabaseError('Error al verificar permisos', error.code, error);
  }

  // Check for admin role (global access)
  if (data.some(role => role.role === 'admin')) {
    return true;
  }

  // Check for specific role in organization
  if (organizationId) {
    return data.some(role => 
      role.role === requiredRole && 
      role.organization_id === organizationId
    );
  }

  // Check for role without organization constraint
  return data.some(role => role.role === requiredRole);
}

export async function getUserOrganizations(
  client: DatabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await client
    .from('user_roles')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .not('organization_id', 'is', null);

  if (error) {
    throw new DatabaseError('Error al obtener organizaciones del usuario', error.code, error);
  }

  return data.map(role => role.organization_id!);
}

// =============================================================================
// TRANSACTION HELPERS
// =============================================================================

export async function withTransaction<T>(
  client: DatabaseClient,
  operation: (client: DatabaseClient) => Promise<T>
): Promise<T> {
  // Note: Supabase doesn't have explicit transactions in the client library
  // This is a placeholder for future implementation or can use stored procedures
  // For now, we'll execute operations sequentially and handle rollback manually if needed
  return await operation(client);
}

// =============================================================================
// COMMON QUERY BUILDERS
// =============================================================================

export function buildSelectQuery(
  client: DatabaseClient,
  tableName: string,
  columns: string = '*'
) {
  return client.from(tableName).select(columns);
}

export function buildInsertQuery<T>(
  client: DatabaseClient,
  tableName: string,
  data: T
) {
  return client.from(tableName).insert(data);
}

export function buildUpdateQuery<T>(
  client: DatabaseClient,
  tableName: string,
  data: T
) {
  return client.from(tableName).update(data);
}

export function buildDeleteQuery(
  client: DatabaseClient,
  tableName: string
) {
  return client.from(tableName).delete();
}

// =============================================================================
// COMMON FILTERS
// =============================================================================

export function applyDateRangeFilter(
  query: any,
  column: string,
  startDate?: string,
  endDate?: string
) {
  if (startDate) {
    query = query.gte(column, startDate);
  }
  if (endDate) {
    query = query.lte(column, endDate);
  }
  return query;
}

export function applyTextSearchFilter(
  query: any,
  column: string,
  searchTerm?: string
) {
  if (searchTerm) {
    query = query.ilike(column, `%${searchTerm}%`);
  }
  return query;
}

export function applyPaginationFilter(
  query: any,
  page: number,
  pageSize: number
) {
  const { from, to } = calculatePagination(page, pageSize);
  return query.range(from, to);
}

// =============================================================================
// CORRECTION HANDLING
// =============================================================================

export async function markAsCorrection<T extends Record<string, any>>(
  client: DatabaseClient,
  tableName: string,
  originalId: string,
  correctedData: T,
  userId: string
): Promise<string> {
  // Get original record
  const { data: original, error: fetchError } = await client
    .from(tableName)
    .select('*')
    .eq('id', originalId)
    .single();

  if (fetchError) {
    throw new DatabaseError('Error al obtener registro original', fetchError.code, fetchError);
  }

  // Mark original as corrected
  const { error: updateError } = await client
    .from(tableName)
    .update({ is_corrected: true })
    .eq('id', originalId);

  if (updateError) {
    throw new DatabaseError('Error al marcar registro como corregido', updateError.code, updateError);
  }

  // Create new corrected record
  const { data: newRecord, error: insertError } = await client
    .from(tableName)
    .insert({
      ...correctedData,
      correction_of: originalId,
      is_corrected: false,
      created_by: userId
    })
    .select('id')
    .single();

  if (insertError) {
    throw new DatabaseError('Error al crear registro corregido', insertError.code, insertError);
  }

  // Log the correction
  await logAudit(client, {
    userId,
    tableName,
    recordId: newRecord.id,
    action: 'INSERT',
    oldValues: original,
    newValues: correctedData
  });

  return newRecord.id;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export async function validateUniqueConstraint(
  client: DatabaseClient,
  tableName: string,
  column: string,
  value: any,
  excludeId?: string
): Promise<boolean> {
  let query = client
    .from(tableName)
    .select('id')
    .eq(column, value);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new DatabaseError('Error al validar restricción única', error.code, error);
  }

  return data.length === 0;
}

export async function validateForeignKey(
  client: DatabaseClient,
  tableName: string,
  id: string
): Promise<boolean> {
  const { data, error } = await client
    .from(tableName)
    .select('id')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw new DatabaseError('Error al validar clave foránea', error.code, error);
  }

  return !!data;
}

// =============================================================================
// CACHE HELPERS (for future implementation)
// =============================================================================

export function getCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

export async function withCache<T>(
  key: string,
  operation: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  // Placeholder for Redis cache implementation
  // For now, just execute the operation
  return await operation();
}