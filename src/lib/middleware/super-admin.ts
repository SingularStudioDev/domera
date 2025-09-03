// =============================================================================
// SUPER ADMIN MIDDLEWARE
// Enhanced security middleware for super admin routes
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

import { validateSuperAdminSession } from "@/lib/auth/super-admin";
import { getDbClient } from "@/lib/dal/base";
import { extractRealIP, sanitizeUserAgent } from "@/lib/utils/security";

/**
 * Enhanced super admin middleware with strict security validation
 */
export async function superAdminMiddleware(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const pathname = request.nextUrl.pathname;

    // Allow access to login page and API endpoints
    if (
      pathname === "/super" ||
      pathname.startsWith("/super/login") ||
      pathname.startsWith("/api/auth/super-admin")
    ) {
      return NextResponse.next();
    }

    // Extract security metadata
    const ipAddress = extractRealIP(request.headers) || request.ip;
    const userAgent = sanitizeUserAgent(request.headers.get("user-agent"));

    // Get session token from cookie
    const sessionToken = request.cookies.get("super-admin-session")?.value;

    if (!sessionToken) {
      console.log("[SUPER_ADMIN_MIDDLEWARE] No session token found");
      return redirectToLogin(request);
    }

    // Validate session
    const sessionValidation = await validateSuperAdminSession(
      sessionToken,
      ipAddress,
    );

    if (!sessionValidation.valid || !sessionValidation.userId) {
      console.log("[SUPER_ADMIN_MIDDLEWARE] Invalid session");
      return redirectToLogin(request);
    }

    // Additional security checks
    const securityCheck = await performSecurityChecks(
      sessionValidation.userId,
      ipAddress,
      userAgent,
    );

    if (!securityCheck.passed) {
      console.log(
        "[SUPER_ADMIN_MIDDLEWARE] Security check failed:",
        securityCheck.reason,
      );
      return redirectToLogin(request, securityCheck.reason);
    }

    // Add user ID to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-Super-Admin-User-Id", sessionValidation.userId);
    requestHeaders.set("X-Super-Admin-IP", ipAddress || "unknown");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("[SUPER_ADMIN_MIDDLEWARE] Error:", error);
    return redirectToLogin(request, "Error de seguridad");
  }
}

/**
 * Redirect to super admin login page
 */
function redirectToLogin(request: NextRequest, reason?: string): NextResponse {
  const loginUrl = new URL("/super", request.url);

  if (reason) {
    loginUrl.searchParams.set("error", reason);
  }

  // Clear the session cookie
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set("super-admin-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/super",
  });

  return response;
}

/**
 * Perform additional security checks
 */
async function performSecurityChecks(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ passed: boolean; reason?: string }> {
  try {
    const client = getDbClient();

    // 1. Verify user is still active and super admin
    const user = await client.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          where: { isActive: true },
        },
      },
    });

    if (!user || !user.isActive) {
      return { passed: false, reason: "Usuario inactivo" };
    }

    const isSuperAdmin = user.userRoles.some(
      (role) => role.role === "admin" && role.organizationId === null,
    );

    if (!isSuperAdmin) {
      return { passed: false, reason: "Privilegios insuficientes" };
    }

    // 2. Check for suspicious activity (optional - can be expanded)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSecurityEvents = await client.securityLog.count({
      where: {
        userIdentifier: userId,
        eventType: {
          in: ["SUPER_ADMIN_SESSION_IP_MISMATCH", "SECURITY_VIOLATION"],
        },
        timestamp: { gte: oneHourAgo },
      },
    });

    if (recentSecurityEvents > 5) {
      return { passed: false, reason: "Actividad sospechosa detectada" };
    }

    // 3. Log access for audit trail
    await client.securityLog.create({
      data: {
        eventType: "SUPER_ADMIN_ACCESS",
        userIdentifier: userId,
        result: "SUCCESS",
        ipAddress,
        userAgent,
        timestamp: new Date(),
        metadata: {
          source: "super_admin_middleware",
          severity: "LOW",
        },
      },
    });

    return { passed: true };
  } catch (error) {
    console.error("[SUPER_ADMIN_MIDDLEWARE] Security check error:", error);
    return { passed: false, reason: "Error de validación de seguridad" };
  }
}

/**
 * Check if path requires super admin access
 */
export function requiresSuperAdminAccess(pathname: string): boolean {
  return (
    pathname.startsWith("/super/dashboard") ||
    pathname.startsWith("/super/admin")
  );
}
