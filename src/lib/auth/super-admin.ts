// =============================================================================
// SUPER ADMIN AUTHENTICATION
// Secure authentication specifically for Domera super administrators
// =============================================================================

import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { LoginSchema } from '@/lib/validations/schemas';
import type { RoleType } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

interface SuperAdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  hasAdminRole: boolean;
}

interface SuperAdminAuthResult {
  success: boolean;
  user?: SuperAdminUser;
  error?: string;
}

// =============================================================================
// SUPER ADMIN VALIDATION
// =============================================================================

/**
 * Validate if user is a super admin
 * Super admins must have:
 * - Active user account
 * - Admin role with null organizationId (global admin)
 * - Active role assignment
 */
export async function validateSuperAdmin(email: string, password: string): Promise<SuperAdminAuthResult> {
  try {
    // Validate input format
    const validatedCredentials = LoginSchema.parse({ email, password });
    
    // Get user with admin role
    const user = await prisma.user.findFirst({
      where: {
        email: validatedCredentials.email,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        isActive: true,
        userRoles: {
          where: { 
            isActive: true,
            role: 'admin' as RoleType,
            organizationId: null // Super admin must have null organizationId
          },
          select: {
            role: true,
            organizationId: true,
            isActive: true,
          },
        },
      },
    });

    // Check if user exists
    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado o no tiene permisos de super administrador'
      };
    }

    // Check if user has super admin role (admin with null organizationId)
    const hasSuperAdminRole = user.userRoles.some(
      role => role.role === 'admin' && role.organizationId === null && role.isActive
    );

    if (!hasSuperAdminRole) {
      return {
        success: false,
        error: 'Usuario no tiene permisos de super administrador'
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedCredentials.password, user.password);
    
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Credenciales incorrectas'
      };
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Return successful authentication
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        hasAdminRole: true
      }
    };

  } catch (error) {
    console.error('Super admin auth error:', error);
    
    // Return generic error to prevent information leakage
    return {
      success: false,
      error: 'Error de autenticación. Intenta nuevamente.'
    };
  }
}

/**
 * Check if user is currently authenticated as super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
      },
      select: {
        userRoles: {
          where: { 
            isActive: true,
            role: 'admin' as RoleType,
            organizationId: null
          },
          select: {
            role: true,
            organizationId: true,
            isActive: true,
          },
        },
      },
    });

    return user?.userRoles.some(
      role => role.role === 'admin' && role.organizationId === null && role.isActive
    ) || false;

  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

/**
 * Get super admin user by ID
 */
export async function getSuperAdmin(userId: string): Promise<SuperAdminUser | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        userRoles: {
          where: { 
            isActive: true,
            role: 'admin' as RoleType,
            organizationId: null
          },
          select: {
            role: true,
            organizationId: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) return null;

    const hasSuperAdminRole = user.userRoles.some(
      role => role.role === 'admin' && role.organizationId === null && role.isActive
    );

    if (!hasSuperAdminRole) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      hasAdminRole: true
    };

  } catch (error) {
    console.error('Error getting super admin:', error);
    return null;
  }
}