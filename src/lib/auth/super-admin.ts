// =============================================================================
// SUPER ADMIN AUTHENTICATION
// Secure authentication specifically for Domera super administrators
// =============================================================================

import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword, hashToken } from '@/lib/auth/password';
import { LoginSchema } from '@/lib/validations/schemas';
import { generateSecureToken, generate2FACode, sanitizeUserAgent } from '@/lib/utils/security';
import { send2FAEmail } from '@/lib/services/email';
import type { RoleType, User } from '@prisma/client';

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

// =============================================================================
// 2FA AND ENHANCED SECURITY
// =============================================================================

interface SuperAdminValidationResult {
  success: boolean;
  user?: User;
  error?: string;
  requiresEmailVerification?: boolean;
}

interface TwoFactorTokenResult {
  success: boolean;
  token?: string;
  expiresAt?: Date;
  error?: string;
}

interface EmailVerificationResult {
  success: boolean;
  valid?: boolean;
  error?: string;
}

/**
 * Validate super admin credentials with enhanced security checks
 */
export async function validateSuperAdminCredentials(
  email: string, 
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<SuperAdminValidationResult> {
  try {
    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          where: { isActive: true },
          include: { organization: true }
        }
      }
    });

    if (!user) {
      // Log failed attempt for security monitoring
      await logSecurityEvent('SUPER_ADMIN_LOGIN_FAILED', email, 'USER_NOT_FOUND', ipAddress, userAgent);
      return { 
        success: false, 
        error: 'Credenciales incorrectas' 
      };
    }

    // 2. Verify user is super admin (admin role without organization)
    const isSuperAdmin = user.userRoles.some(role => 
      role.role === 'admin' && role.organizationId === null
    );

    if (!isSuperAdmin) {
      await logSecurityEvent('SUPER_ADMIN_LOGIN_FAILED', email, 'NOT_SUPER_ADMIN', ipAddress, userAgent);
      return { 
        success: false, 
        error: 'Acceso no autorizado' 
      };
    }

    // 3. Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      await logSecurityEvent('SUPER_ADMIN_LOGIN_FAILED', email, 'INVALID_PASSWORD', ipAddress, userAgent);
      return { 
        success: false, 
        error: 'Credenciales incorrectas' 
      };
    }

    // 4. Check if account is active
    if (!user.isActive) {
      await logSecurityEvent('SUPER_ADMIN_LOGIN_FAILED', email, 'ACCOUNT_INACTIVE', ipAddress, userAgent);
      return { 
        success: false, 
        error: 'Cuenta inactiva' 
      };
    }

    // 5. Check for recent failed attempts
    const recentFailedAttempts = await getRecentFailedAttempts(email);
    if (recentFailedAttempts >= 5) {
      await logSecurityEvent('SUPER_ADMIN_LOGIN_FAILED', email, 'TOO_MANY_ATTEMPTS', ipAddress, userAgent);
      return { 
        success: false, 
        error: 'Demasiados intentos fallidos. Intenta más tarde.' 
      };
    }

    // Log successful credential validation
    await logSecurityEvent('SUPER_ADMIN_CREDENTIALS_VALID', email, 'SUCCESS', ipAddress, userAgent);

    return { 
      success: true, 
      user,
      requiresEmailVerification: true 
    };

  } catch (error) {
    console.error('[SUPER_ADMIN] Validation error:', error);
    return { 
      success: false, 
      error: 'Error interno de validación' 
    };
  }
}

/**
 * Generate and send 2FA token via email
 */
export async function generateAndSend2FAToken(
  userId: string,
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<TwoFactorTokenResult> {
  try {
    // Generate secure 6-digit token
    const token = generate2FACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store token in database (overwrite any existing token)
    await prisma.twoFactorToken.upsert({
      where: { userId },
      update: {
        token: await hashToken(token), // Hash the token for security
        expiresAt,
        isUsed: false,
        attempts: 0
      },
      create: {
        userId,
        token: await hashToken(token),
        expiresAt,
        isUsed: false,
        attempts: 0
      }
    });

    // Send email with token
    const emailResult = await send2FAEmail(email, token, ipAddress, userAgent);

    if (!emailResult.success) {
      await logSecurityEvent('SUPER_ADMIN_2FA_EMAIL_FAILED', email, 'EMAIL_SEND_ERROR', ipAddress, userAgent);
      return { 
        success: false, 
        error: 'Error enviando código de verificación' 
      };
    }

    await logSecurityEvent('SUPER_ADMIN_2FA_TOKEN_SENT', email, 'SUCCESS', ipAddress, userAgent);

    return { 
      success: true, 
      token: token, // Return plain token for testing (remove in production)
      expiresAt 
    };

  } catch (error) {
    console.error('[SUPER_ADMIN] 2FA token generation error:', error);
    return { 
      success: false, 
      error: 'Error generando código de verificación' 
    };
  }
}

/**
 * Verify 2FA token
 */
export async function verify2FAToken(
  userId: string,
  providedToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<EmailVerificationResult> {
  try {
    // Get stored token
    const storedTokenRecord = await prisma.twoFactorToken.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!storedTokenRecord) {
      await logSecurityEvent('SUPER_ADMIN_2FA_VERIFY_FAILED', userId, 'NO_TOKEN_FOUND', ipAddress, userAgent);
      return { 
        success: false, 
        error: 'Token no encontrado' 
      };
    }

    // Check if token is expired
    if (storedTokenRecord.expiresAt < new Date()) {
      await logSecurityEvent('SUPER_ADMIN_2FA_VERIFY_FAILED', userId, 'TOKEN_EXPIRED', ipAddress, userAgent);
      return { 
        success: false, 
        error: 'Token expirado' 
      };
    }

    // Check if token is already used
    if (storedTokenRecord.isUsed) {
      await logSecurityEvent('SUPER_ADMIN_2FA_VERIFY_FAILED', userId, 'TOKEN_ALREADY_USED', ipAddress, userAgent);
      return { 
        success: false, 
        error: 'Token ya utilizado' 
      };
    }

    // Check attempts limit
    if (storedTokenRecord.attempts >= 3) {
      await logSecurityEvent('SUPER_ADMIN_2FA_VERIFY_FAILED', userId, 'TOO_MANY_ATTEMPTS', ipAddress, userAgent);
      return { 
        success: false, 
        error: 'Demasiados intentos. Solicita un nuevo código.' 
      };
    }

    // Verify token
    const isValidToken = await verifyPassword(providedToken, storedTokenRecord.token);
    
    if (!isValidToken) {
      // Increment attempts
      await prisma.twoFactorToken.update({
        where: { userId },
        data: { attempts: { increment: 1 } }
      });

      await logSecurityEvent('SUPER_ADMIN_2FA_VERIFY_FAILED', userId, 'INVALID_TOKEN', ipAddress, userAgent);
      return { 
        success: false, 
        error: 'Código incorrecto' 
      };
    }

    // Mark token as used
    await prisma.twoFactorToken.update({
      where: { userId },
      data: { isUsed: true }
    });

    await logSecurityEvent('SUPER_ADMIN_2FA_VERIFY_SUCCESS', userId, 'SUCCESS', ipAddress, userAgent);

    return { 
      success: true, 
      valid: true 
    };

  } catch (error) {
    console.error('[SUPER_ADMIN] 2FA verification error:', error);
    return { 
      success: false, 
      error: 'Error verificando código' 
    };
  }
}

/**
 * Generate super admin session token with enhanced security
 */
export async function generateSuperAdminSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ sessionToken: string; expiresAt: Date }> {
  const sessionToken = generateSecureToken(64);
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours

  await prisma.superAdminSession.upsert({
    where: { userId },
    update: {
      sessionToken: await hashToken(sessionToken),
      expiresAt,
      ipAddress,
      userAgent: sanitizeUserAgent(userAgent),
      isActive: true,
      lastUsed: new Date()
    },
    create: {
      userId,
      sessionToken: await hashToken(sessionToken),
      expiresAt,
      ipAddress,
      userAgent: sanitizeUserAgent(userAgent),
      isActive: true
    }
  });

  await logSecurityEvent('SUPER_ADMIN_SESSION_CREATED', userId, 'SUCCESS', ipAddress, userAgent);

  return { sessionToken, expiresAt };
}

/**
 * Validate super admin session
 */
export async function validateSuperAdminSession(
  sessionToken: string,
  ipAddress?: string
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    const sessions = await prisma.superAdminSession.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    for (const session of sessions) {
      const isValidToken = await verifyPassword(sessionToken, session.sessionToken);
      
      if (isValidToken) {
        // Optional: Validate IP address for additional security
        if (session.ipAddress && ipAddress && session.ipAddress !== ipAddress) {
          await logSecurityEvent('SUPER_ADMIN_SESSION_IP_MISMATCH', session.userId, 'SECURITY_WARNING', ipAddress);
          // Could choose to invalidate session or just log warning
        }

        // Update last used timestamp
        await prisma.superAdminSession.update({
          where: { userId: session.userId },
          data: { lastUsed: new Date() }
        });

        return { valid: true, userId: session.userId };
      }
    }

    return { valid: false, error: 'Sesión inválida' };

  } catch (error) {
    console.error('[SUPER_ADMIN] Session validation error:', error);
    return { valid: false, error: 'Error validando sesión' };
  }
}

/**
 * Invalidate super admin session
 */
export async function invalidateSuperAdminSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await prisma.superAdminSession.updateMany({
      where: { userId },
      data: { isActive: false }
    });

    await logSecurityEvent('SUPER_ADMIN_SESSION_INVALIDATED', userId, 'SUCCESS', ipAddress, userAgent);

  } catch (error) {
    console.error('[SUPER_ADMIN] Session invalidation error:', error);
  }
}

// =============================================================================
// SECURITY UTILITIES
// =============================================================================

/**
 * Log security events for super admin actions
 */
async function logSecurityEvent(
  eventType: string,
  userIdentifier: string,
  result: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await prisma.securityLog.create({
      data: {
        eventType,
        userIdentifier,
        result,
        ipAddress,
        userAgent: sanitizeUserAgent(userAgent),
        timestamp: new Date(),
        metadata: {
          source: 'super_admin_auth',
          severity: eventType.includes('FAILED') ? 'HIGH' : 'MEDIUM'
        }
      }
    });
  } catch (error) {
    console.error('[SUPER_ADMIN] Security logging error:', error);
  }
}

/**
 * Get recent failed login attempts
 */
async function getRecentFailedAttempts(email: string): Promise<number> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const failedAttempts = await prisma.securityLog.count({
      where: {
        userIdentifier: email,
        eventType: 'SUPER_ADMIN_LOGIN_FAILED',
        timestamp: { gte: oneHourAgo }
      }
    });

    return failedAttempts;
  } catch (error) {
    console.error('[SUPER_ADMIN] Failed attempts check error:', error);
    return 0;
  }
}