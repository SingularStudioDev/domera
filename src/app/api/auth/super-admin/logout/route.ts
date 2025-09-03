// =============================================================================
// SUPER ADMIN LOGOUT API
// Invalidates super admin session and logs security event
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

import { invalidateSuperAdminSession } from "@/lib/auth/super-admin";
import { extractRealIP, sanitizeUserAgent } from "@/lib/utils/security";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // Extract security metadata
    const ipAddress = extractRealIP(request.headers);
    const userAgent = sanitizeUserAgent(request.headers.get("user-agent"));

    // If userId provided, invalidate that specific session
    if (userId) {
      await invalidateSuperAdminSession(userId, ipAddress, userAgent);
    }

    // Create response and clear cookie
    const response = NextResponse.json({
      success: true,
      data: {
        message: "Sesión cerrada exitosamente",
      },
    });

    // Clear the session cookie
    response.cookies.set("super-admin-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/super",
    });

    return response;
  } catch (error) {
    console.error("[API] Super admin logout error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
