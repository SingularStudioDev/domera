// =============================================================================
// VERIFICATION SERVER ACTIONS
// Server actions for KYC verification management
// =============================================================================

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { validateSession } from "@/lib/auth/validation";
import {
  createVerificationSession as createSessionDAL,
  getUserVerificationInfo,
  getUserVerificationSessions,
  getLatestVerificationSession,
  isUserVerified,
} from "@/lib/dal/verification";
import { createVerificationSession } from "@/lib/services/didit";
import {
  VerificationError,
  DiditApiError,
} from "@/lib/types/verification";
import type {
  StartVerificationInput,
  StartVerificationResult,
  VerificationActionResult,
  VerificationStatusResult,
} from "@/lib/types/verification";
import { extractRealIP } from "@/lib/utils/security";
import { serializeObject } from "@/lib/utils/serialization";

// =============================================================================
// USER VERIFICATION ACTIONS
// =============================================================================

/**
 * Start a new verification process for the current user
 */
export async function startVerificationAction(
  input?: Partial<StartVerificationInput>
): Promise<VerificationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    const user = authResult.user;

    // Get request headers for audit
    const headersList = await headers();
    const ipAddress = extractRealIP(headersList);
    const userAgent = headersList.get("User-Agent");

    // Check if user is already verified
    const isVerifiedResult = await isUserVerified(user.id);
    if (isVerifiedResult.data === true) {
      return {
        success: false,
        error: "El usuario ya está verificado",
      };
    }

    // Check for existing pending session
    const latestSessionResult = await getLatestVerificationSession(user.id);
    if (latestSessionResult.data) {
      const latestSession = latestSessionResult.data;
      const isPending = ["NOT_STARTED", "IN_PROGRESS", "IN_REVIEW"].includes(latestSession.status);

      // Only return existing session if it has a valid verification URL
      if (isPending && latestSession.verificationUrl) {
        return {
          success: true,
          data: {
            sessionId: latestSession.sessionId,
            verificationUrl: latestSession.verificationUrl,
            status: latestSession.status,
            isExisting: true,
          } as StartVerificationResult & { isExisting: boolean },
        };
      }
    }

    // Create new verification session with Didit
    const callbackUrl = input?.callbackUrl || `${process.env.NEXTAUTH_URL}/verification/callback`;
    const diditResponse = await createVerificationSession(user.id, callbackUrl);

    // Store session in database
    const sessionResult = await createSessionDAL(
      user.id,
      diditResponse.session_id,
      diditResponse.session_token,
      diditResponse.url,  // Use "url" field from Didit response
      ipAddress,
      userAgent
    );

    if (!sessionResult.data) {
      return {
        success: false,
        error: sessionResult.error || "Error creando sesión de verificación",
      };
    }


    // Revalidate verification-related pages
    revalidatePath("/dashboard/profile");
    revalidatePath("/verification");

    return {
      success: true,
      data: {
        sessionId: diditResponse.session_id,
        verificationUrl: diditResponse.url,  // Use "url" field from Didit response
        status: "NOT_STARTED",
      } as StartVerificationResult,
    };

  } catch (error) {
    console.error("[SERVER_ACTION] Error starting verification:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === "VerificationError" || error.name === "DiditApiError") {
        return {
          success: false,
          error: error.message,
        };
      }
    }

    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

/**
 * Get verification status for the current user
 */
export async function getVerificationStatusAction(): Promise<VerificationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    const user = authResult.user;

    // Get user verification information
    const verificationInfoResult = await getUserVerificationInfo(user.id);
    if (!verificationInfoResult.data) {
      return {
        success: false,
        error: verificationInfoResult.error || "Error obteniendo información de verificación",
      };
    }

    const verificationInfo = verificationInfoResult.data;
    const latestSession = verificationInfo.latestSession;

    const statusResult: VerificationStatusResult = {
      status: latestSession?.status || "NOT_STARTED",
      isVerified: verificationInfo.isVerified,
      canRetry: latestSession ?
        ["DECLINED", "EXPIRED", "ABANDONED"].includes(latestSession.status) :
        true,
      session: latestSession,
    };

    return {
      success: true,
      data: serializeObject(statusResult),
    };

  } catch (error) {
    console.error("[SERVER_ACTION] Error getting verification status:", error);
    return {
      success: false,
      error: "Error obteniendo estado de verificación",
    };
  }
}

/**
 * Get all verification sessions for the current user
 */
export async function getUserVerificationSessionsAction(): Promise<VerificationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    const user = authResult.user;

    // Get user verification sessions
    const sessionsResult = await getUserVerificationSessions(user.id);
    if (!sessionsResult.data) {
      return {
        success: false,
        error: sessionsResult.error || "Error obteniendo sesiones de verificación",
      };
    }

    return {
      success: true,
      data: serializeObject(sessionsResult.data),
    };

  } catch (error) {
    console.error("[SERVER_ACTION] Error getting user verification sessions:", error);
    return {
      success: false,
      error: "Error obteniendo sesiones de verificación",
    };
  }
}

/**
 * Retry verification (start new session if previous failed)
 */
export async function retryVerificationAction(): Promise<VerificationActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    const user = authResult.user;

    // Check current verification status
    const statusResult = await getVerificationStatusAction();
    if (!statusResult.success) {
      return statusResult;
    }

    const status = (statusResult.data as VerificationStatusResult);

    // Check if retry is allowed
    if (status.isVerified) {
      return {
        success: false,
        error: "El usuario ya está verificado",
      };
    }

    if (!status.canRetry) {
      return {
        success: false,
        error: "No se puede reintentar la verificación en este momento",
      };
    }

    // Start new verification session
    return await startVerificationAction();

  } catch (error) {
    console.error("[SERVER_ACTION] Error retrying verification:", error);
    return {
      success: false,
      error: "Error reintentando verificación",
    };
  }
}

// =============================================================================
// UTILITY ACTIONS
// =============================================================================

/**
 * Check if current user is verified (helper for conditional UI)
 */
export async function isCurrentUserVerifiedAction(): Promise<boolean> {
  try {
    const authResult = await validateSession();
    if (!authResult.success || !authResult.user) {
      return false;
    }

    const result = await isUserVerified(authResult.user.id);
    return result.data || false;
  } catch (error) {
    console.error("[SERVER_ACTION] Error checking if user is verified:", error);
    return false;
  }
}

/**
 * Get verification summary for current user
 */
export async function getVerificationSummaryAction(): Promise<{
  isVerified: boolean;
  verificationCompletedAt?: Date;
  hasActiveSessions: boolean;
  canStartVerification: boolean;
}> {
  try {
    const authResult = await validateSession();
    if (!authResult.success || !authResult.user) {
      return {
        isVerified: false,
        hasActiveSessions: false,
        canStartVerification: false,
      };
    }

    const user = authResult.user;
    const verificationInfoResult = await getUserVerificationInfo(user.id);

    if (!verificationInfoResult.data) {
      return {
        isVerified: false,
        hasActiveSessions: false,
        canStartVerification: true,
      };
    }

    const verificationInfo = verificationInfoResult.data;
    const latestSession = verificationInfo.latestSession;

    const hasActiveSessions = latestSession ?
      ["NOT_STARTED", "IN_PROGRESS", "IN_REVIEW"].includes(latestSession.status) :
      false;

    const canStartVerification = !verificationInfo.isVerified && !hasActiveSessions;

    return {
      isVerified: verificationInfo.isVerified,
      verificationCompletedAt: verificationInfo.verificationCompletedAt,
      hasActiveSessions,
      canStartVerification,
    };

  } catch (error) {
    console.error("[SERVER_ACTION] Error getting verification summary:", error);
    return {
      isVerified: false,
      hasActiveSessions: false,
      canStartVerification: false,
    };
  }
}