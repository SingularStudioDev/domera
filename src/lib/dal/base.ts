// =============================================================================
// BASE DATA ACCESS LAYER FOR DOMERA PLATFORM
// Core functions and utilities for database operations
// Created: August 2025
// =============================================================================

import { prisma } from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';

// =============================================================================
// BASE DATABASE CLIENT
// =============================================================================

export type DatabaseClient = PrismaClient;

/**
 * Get Prisma database client
 * Single point of database access following Next.js best practices
 */
export function getDbClient(): DatabaseClient {
  return prisma;
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
    await client.auditLog.create({
      data: {
        userId,
        organizationId,
        tableName,
        recordId,
        action,
        oldValues,
        newValues,
        ipAddress,
        userAgent
      }
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

// Note: getCurrentUser is now handled by centralized auth validation
// Use validateSession() from @/lib/auth/validation instead

export async function getUserWithRoles(client: DatabaseClient, email: string) {
  try {
    const user = await client.user.findFirst({
      where: {
        email,
        isActive: true
      },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            organization: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new DatabaseError('Usuario no encontrado', 'USER_NOT_FOUND');
    }

    return user;
  } catch (error) {
    throw new DatabaseError('Error al obtener usuario', 'DB_ERROR', error);
  }
}

export async function checkUserPermission(
  client: DatabaseClient,
  userId: string,
  requiredRole: string,
  organizationId?: string
): Promise<boolean> {
  try {
    const userRoles = await client.userRole.findMany({
      where: {
        userId,
        isActive: true
      },
      select: {
        role: true,
        organizationId: true
      }
    });

    // Check for admin role (global access)
    if (userRoles.some(role => role.role === 'admin')) {
      return true;
    }

    // Check for specific role in organization
    if (organizationId) {
      return userRoles.some(role => 
        role.role === requiredRole && 
        role.organizationId === organizationId
      );
    }

    // Check for role without organization constraint
    return userRoles.some(role => role.role === requiredRole);
  } catch (error) {
    throw new DatabaseError('Error al verificar permisos', 'PERMISSION_ERROR', error);
  }
}

export async function getUserOrganizations(
  client: DatabaseClient,
  userId: string
): Promise<string[]> {
  try {
    const userRoles = await client.userRole.findMany({
      where: {
        userId,
        isActive: true,
        organizationId: {
          not: null
        }
      },
      select: {
        organizationId: true
      }
    });

    return userRoles
      .filter(role => role.organizationId)
      .map(role => role.organizationId!);
  } catch (error) {
    throw new DatabaseError('Error al obtener organizaciones del usuario', 'ORG_FETCH_ERROR', error);
  }
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

// Note: Query builders are not needed with Prisma
// Use Prisma's type-safe query methods directly:
// client.model.findMany(), client.model.create(), client.model.update(), etc.

// =============================================================================
// COMMON FILTERS
// =============================================================================

// Prisma filter helpers
export function buildDateRangeFilter(startDate?: string, endDate?: string) {
  const filter: any = {};
  if (startDate) filter.gte = new Date(startDate);
  if (endDate) filter.lte = new Date(endDate);
  return Object.keys(filter).length > 0 ? filter : undefined;
}

export function buildTextSearchFilter(searchTerm?: string) {
  return searchTerm ? {
    contains: searchTerm,
    mode: 'insensitive' as const
  } : undefined;
}

export function buildPaginationOptions(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  return {
    skip,
    take: pageSize
  };
}

// =============================================================================
// CORRECTION HANDLING
// =============================================================================

// Note: markAsCorrection is model-specific with Prisma
// Each model should implement its own correction logic
// using Prisma transactions and proper type safety

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

// Note: validateUniqueConstraint is model-specific with Prisma
// Use Prisma's built-in unique constraints and findFirst/findUnique
// for type-safe validation

// Note: validateForeignKey is model-specific with Prisma
// Use Prisma's built-in foreign key constraints and findUnique
// for type-safe validation

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