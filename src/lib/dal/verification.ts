// =============================================================================
// VERIFICATION DATA ACCESS LAYER
// Database operations for KYC verification management
// =============================================================================

import type { VerificationStatus } from "@prisma/client";

import {
  failure,
  getDbClient,
  logAudit,
  success,
  type DatabaseClient,
  type Result,
} from "@/lib/dal/base";
import type {
  DiditDecision,
  UserVerificationInfo,
  VerificationSession,
} from "@/lib/types/verification";

// =============================================================================
// VERIFICATION SESSION OPERATIONS
// =============================================================================

/**
 * Create or update a verification session
 */
export async function createVerificationSession(
  userId: string,
  sessionId: string,
  sessionToken: string,
  verificationUrl: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<VerificationSession>> {
  try {
    const client = getDbClient();

    // Use upsert to handle existing sessionId
    const session = await client.verificationSession.upsert({
      where: {
        sessionId: sessionId,
      },
      update: {
        sessionToken,
        verificationUrl,
        status: "NOT_STARTED",
        updatedAt: new Date(),
      },
      create: {
        sessionId,
        sessionToken,
        status: "NOT_STARTED",
        userId,
        verificationUrl,
      },
    });

    // Log audit
    await logAudit(client, {
      userId,
      tableName: "verification_sessions",
      recordId: session.id,
      action: "INSERT",
      newValues: {
        sessionId: session.sessionId,
        status: session.status,
      },
      ipAddress,
      userAgent,
    });

    return success(session as VerificationSession);
  } catch (error) {
    console.error("Error creating verification session:", error);
    return failure("Error creando sesión de verificación");
  }
}

/**
 * Update verification session status
 */
export async function updateVerificationSession(
  sessionId: string,
  status: VerificationStatus,
  decision?: DiditDecision,
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<VerificationSession>> {
  try {
    const client = getDbClient();

    // Get current session for audit
    const currentSession = await client.verificationSession.findUnique({
      where: { sessionId },
    });

    if (!currentSession) {
      return failure("Sesión de verificación no encontrada");
    }

    const updatedSession = await client.verificationSession.update({
      where: { sessionId },
      data: {
        status,
        decision: decision ? (decision as any) : undefined,
        updatedAt: new Date(),
      },
    });

    // Log audit
    await logAudit(client, {
      userId: currentSession.userId,
      tableName: "verification_sessions",
      recordId: currentSession.id,
      action: "UPDATE",
      oldValues: { status: currentSession.status },
      newValues: { status, decision },
      ipAddress,
      userAgent,
    });

    return success(updatedSession as VerificationSession);
  } catch (error) {
    console.error("Error updating verification session:", error);
    return failure("Error actualizando sesión de verificación");
  }
}

/**
 * Get verification session by Didit session ID
 */
export async function getVerificationSessionBySessionId(
  sessionId: string,
): Promise<Result<VerificationSession | null>> {
  try {
    const client = getDbClient();

    const session = await client.verificationSession.findUnique({
      where: { sessionId },
    });

    return success(session as VerificationSession | null);
  } catch (error) {
    console.error("Error getting verification session:", error);
    return failure("Error obteniendo sesión de verificación");
  }
}

/**
 * Get latest verification session for a user
 */
export async function getLatestVerificationSession(
  userId: string,
): Promise<Result<VerificationSession | null>> {
  try {
    const client = getDbClient();

    const session = await client.verificationSession.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return success(session as VerificationSession | null);
  } catch (error) {
    console.error("Error getting latest verification session:", error);
    return failure("Error obteniendo última sesión de verificación");
  }
}

/**
 * Get all verification sessions for a user
 */
export async function getUserVerificationSessions(
  userId: string,
): Promise<Result<VerificationSession[]>> {
  try {
    const client = getDbClient();

    const sessions = await client.verificationSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return success(sessions as VerificationSession[]);
  } catch (error) {
    console.error("Error getting user verification sessions:", error);
    return failure("Error obteniendo sesiones de verificación del usuario");
  }
}

// =============================================================================
// USER VERIFICATION OPERATIONS
// =============================================================================

/**
 * Mark user as verified
 */
export async function markUserVerified(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<boolean>> {
  try {
    const client = getDbClient();

    // Get current user state for audit
    const currentUser = await client.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    });

    if (!currentUser) {
      return failure("Usuario no encontrado");
    }

    await client.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verificationCompletedAt: new Date(),
      },
    });

    // Log audit
    await logAudit(client, {
      userId,
      tableName: "users",
      recordId: userId,
      action: "UPDATE",
      oldValues: { isVerified: currentUser.isVerified },
      newValues: { isVerified: true },
      ipAddress,
      userAgent,
    });

    return success(true);
  } catch (error) {
    console.error("Error marking user as verified:", error);
    return failure("Error marcando usuario como verificado");
  }
}

/**
 * Get user verification information
 */
export async function getUserVerificationInfo(
  userId: string,
): Promise<Result<UserVerificationInfo>> {
  try {
    const client = getDbClient();

    const user = await client.user.findUnique({
      where: { id: userId },
      select: {
        isVerified: true,
        verificationCompletedAt: true,
        verificationSessions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return failure("Usuario no encontrado");
    }

    const verificationInfo: UserVerificationInfo = {
      isVerified: user.isVerified,
      verificationCompletedAt: user.verificationCompletedAt,
      latestSession: user.verificationSessions[0] as VerificationSession | undefined,
    };

    return success(verificationInfo);
  } catch (error) {
    console.error("Error getting user verification info:", error);
    return failure("Error obteniendo información de verificación del usuario");
  }
}

/**
 * Check if user is verified
 */
export async function isUserVerified(userId: string): Promise<Result<boolean>> {
  try {
    const client = getDbClient();

    const user = await client.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    });

    if (!user) {
      return failure("Usuario no encontrado");
    }

    return success(user.isVerified);
  } catch (error) {
    console.error("Error checking if user is verified:", error);
    return failure("Error verificando estado de verificación del usuario");
  }
}

// =============================================================================
// ADMIN OPERATIONS
// =============================================================================

/**
 * Get verification statistics for admin dashboard
 */
export async function getVerificationStats(): Promise<Result<{
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  failedVerifications: number;
  todayVerifications: number;
}>> {
  try {
    const client = getDbClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      verifiedUsers,
      pendingVerifications,
      failedVerifications,
      todayVerifications,
    ] = await Promise.all([
      client.user.count(),
      client.user.count({ where: { isVerified: true } }),
      client.verificationSession.count({
        where: {
          status: { in: ["NOT_STARTED", "IN_PROGRESS", "IN_REVIEW"] },
        },
      }),
      client.verificationSession.count({
        where: { status: "DECLINED" },
      }),
      client.verificationSession.count({
        where: {
          status: "APPROVED",
          updatedAt: { gte: today },
        },
      }),
    ]);

    return success({
      totalUsers,
      verifiedUsers,
      pendingVerifications,
      failedVerifications,
      todayVerifications,
    });
  } catch (error) {
    console.error("Error getting verification stats:", error);
    return failure("Error obteniendo estadísticas de verificación");
  }
}

/**
 * Get all verification sessions with pagination
 */
export async function getAllVerificationSessions(
  page: number = 1,
  pageSize: number = 20,
): Promise<Result<{
  sessions: (VerificationSession & { user: { email: string; firstName: string; lastName: string } })[];
  total: number;
  totalPages: number;
}>> {
  try {
    const client = getDbClient();

    const skip = (page - 1) * pageSize;

    const [sessions, total] = await Promise.all([
      client.verificationSession.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      client.verificationSession.count(),
    ]);

    return success({
      sessions: sessions as any,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error getting all verification sessions:", error);
    return failure("Error obteniendo todas las sesiones de verificación");
  }
}

// =============================================================================
// CLEANUP OPERATIONS
// =============================================================================

/**
 * Clean up old expired verification sessions
 */
export async function cleanupExpiredSessions(): Promise<Result<number>> {
  try {
    const client = getDbClient();

    // Delete sessions older than 7 days that are not approved
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await client.verificationSession.deleteMany({
      where: {
        createdAt: { lt: sevenDaysAgo },
        status: { in: ["NOT_STARTED", "EXPIRED", "ABANDONED"] },
      },
    });

    return success(result.count);
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    return failure("Error limpiando sesiones expiradas");
  }
}