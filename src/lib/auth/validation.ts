// =============================================================================
// CENTRALIZED AUTH AND SESSION VALIDATION
// Reusable authentication and authorization utilities for Server Actions and Server Components
// =============================================================================

"use server";

import { headers } from "next/headers";

import { RoleType } from "@prisma/client";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/config";
import { validateSuperAdminSession } from "@/lib/auth/super-admin";
import { prisma } from "@/lib/prisma";
import { extractRealIP } from "@/lib/utils/security";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string;
  phone?: string;
  lastName?: string;
  avatarUrl?: string;
  userRoles: {
    role: RoleType;
    organizationId: string | null;
    isActive: boolean;
    organization?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }[];
}

export interface AuthValidationResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

export interface RoleValidationResult {
  success: boolean;
  user?: AuthenticatedUser;
  hasRole?: boolean;
  error?: string;
}

// =============================================================================
// CORE AUTH VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates current session and returns user with roles
 * Use this in Server Actions and Server Components that require authentication
 */
export async function validateSession(): Promise<AuthValidationResult> {
  try {
    // First try NextAuth session
    const session = await getServerSession(authOptions);

    if (session?.user) {
      // Get full user data with roles from database
      const user = await prisma.user.findFirst({
        where: {
          email: session.user.email!,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          phone: true,
          lastName: true,
          avatarUrl: true,
          userRoles: {
            where: { isActive: true },
            select: {
              role: true,
              organizationId: true,
              isActive: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (user) {
        return {
          success: true,
          user: user as AuthenticatedUser,
        };
      }
    }

    // If no NextAuth session, try super admin session
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");

    const sessionCookies = cookieHeader
      ?.split(";")
      .filter((c) => c.trim().startsWith("super-admin-session="))
      .map((c) => c.split("=")[1]);

    const sessionCookie = sessionCookies?.pop(); // Get the last one

    if (sessionCookie) {
      const ipAddress = extractRealIP(headersList);
      const sessionValidation = await validateSuperAdminSession(
        sessionCookie,
        ipAddress,
      );

      if (sessionValidation.valid && sessionValidation.userId) {
        // Get user with roles for super admin
        const user = await prisma.user.findUnique({
          where: { id: sessionValidation.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            userRoles: {
              where: { isActive: true },
              select: {
                role: true,
                organizationId: true,
                isActive: true,
                organization: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        });

        if (user) {
          return {
            success: true,
            user: user as AuthenticatedUser,
          };
        }
      }
    }

    return {
      success: false,
      error: "Usuario no autenticado",
    };
  } catch (error) {
    console.error("Error validating session:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

/**
 * Validates that current user has required role
 * Use this in Server Actions that require specific permissions
 */
export async function requireRole(
  requiredRole: RoleType,
  organizationId?: string,
): Promise<RoleValidationResult> {
  try {
    const authResult = await validateSession();

    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error,
      };
    }

    const user = authResult.user;

    // Check for admin role (global access)
    const isAdmin = user.userRoles.some((role) => role.role === "admin");
    if (isAdmin) {
      return {
        success: true,
        user,
        hasRole: true,
      };
    }

    // Check for specific role
    let hasRole = false;

    if (organizationId) {
      // Check for role in specific organization
      hasRole = user.userRoles.some(
        (role) =>
          role.role === requiredRole &&
          role.organizationId === organizationId &&
          role.isActive,
      );
    } else {
      // Check for role without organization constraint
      hasRole = user.userRoles.some(
        (role) => role.role === requiredRole && role.isActive,
      );
    }

    if (!hasRole) {
      return {
        success: false,
        hasRole: false,
        user,
        error: "No tienes permisos para realizar esta acción",
      };
    }

    return {
      success: true,
      user,
      hasRole: true,
    };
  } catch (error) {
    console.error("Error validating role:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

/**
 * Validates that current user belongs to specified organization
 * Use this in Server Actions that operate on organization-specific data
 */
export async function requireOrganizationAccess(
  organizationId: string,
): Promise<RoleValidationResult> {
  try {
    const authResult = await validateSession();

    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error,
      };
    }

    const user = authResult.user;

    // Check for admin role (global access)
    const isAdmin = user.userRoles.some((role) => role.role === "admin");
    if (isAdmin) {
      return {
        success: true,
        user,
        hasRole: true,
      };
    }

    // Check if user belongs to organization
    const belongsToOrg = user.userRoles.some(
      (role) => role.organizationId === organizationId && role.isActive,
    );

    if (!belongsToOrg) {
      return {
        success: false,
        hasRole: false,
        user,
        error: "No tienes acceso a esta organización",
      };
    }

    return {
      success: true,
      user,
      hasRole: true,
    };
  } catch (error) {
    console.error("Error validating organization access:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

/**
 * Get current authenticated user with roles
 * Use this in Server Components for read operations
 */
export async function getCurrentUserWithRoles(): Promise<AuthenticatedUser | null> {
  const result = await validateSession();
  return result.success ? result.user! : null;
}

/**
 * Check if current user has specific role
 * Use this for conditional UI rendering in Server Components
 */
export async function hasRole(
  requiredRole: RoleType,
  organizationId?: string,
): Promise<boolean> {
  const result = await requireRole(requiredRole, organizationId);
  return result.success && result.hasRole === true;
}

/**
 * Check if current user is admin
 * Use this for admin-only features
 */
export async function isAdmin(): Promise<boolean> {
  return await hasRole("admin");
}

/**
 * Get user's organizations
 * Use this to determine which organizations user has access to
 */
export async function getUserOrganizations(): Promise<string[]> {
  const result = await validateSession();

  if (!result.success || !result.user) {
    return [];
  }

  return result.user.userRoles
    .filter((role) => role.organizationId && role.isActive)
    .map((role) => role.organizationId!);
}

// =============================================================================
// SPECIALIZED VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates user can access project (based on organization)
 * Use this in project-related Server Actions
 */
export async function validateProjectAccess(
  projectId: string,
): Promise<RoleValidationResult> {
  try {
    const authResult = await validateSession();

    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error,
      };
    }

    // Get project organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!project) {
      return {
        success: false,
        error: "Proyecto no encontrado",
      };
    }

    // Validate organization access
    return await requireOrganizationAccess(project.organizationId);
  } catch (error) {
    console.error("Error validating project access:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

/**
 * Validates user can access operation (based on ownership or organization role)
 * Use this in operation-related Server Actions
 */
export async function validateOperationAccess(
  operationId: string,
): Promise<RoleValidationResult> {
  try {
    const authResult = await validateSession();

    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error,
      };
    }

    const user = authResult.user;

    // Get operation with project info
    // TODO define if we need to  check organization belongness
    const operation = await prisma.operation.findUnique({
      where: { id: operationId },
      select: {
        userId: true,

        project: {
          select: { organizationId: true },
        },
      },
    });

    if (!operation) {
      return {
        success: false,
        error: "Operación no encontrada",
      };
    }

    // Check if user owns the operation
    if (operation.userId === user.id) {
      return {
        success: true,
        user,
        hasRole: true,
      };
    }

    // Check if user has organization access
    return await requireOrganizationAccess(operation.project.organizationId);
  } catch (error) {
    console.error("Error validating operation access:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}
