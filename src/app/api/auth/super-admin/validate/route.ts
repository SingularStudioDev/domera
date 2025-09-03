// =============================================================================
// SUPER ADMIN CREDENTIAL VALIDATION API
// Validates super admin credentials and triggers 2FA flow
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

import {
  generateAndSend2FAToken,
  validateSuperAdminCredentials,
} from "@/lib/auth/super-admin";
import { extractRealIP, sanitizeUserAgent } from "@/lib/utils/security";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email y contraseña son requeridos" },
        { status: 400 },
      );
    }

    // Extract security metadata
    const ipAddress = extractRealIP(request.headers);
    const userAgent = sanitizeUserAgent(request.headers.get("user-agent"));

    // Validate credentials
    const validationResult = await validateSuperAdminCredentials(
      email.toLowerCase().trim(),
      password,
      ipAddress,
      userAgent,
    );

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 401 },
      );
    }

    const user = validationResult.user!;

    // Generate and send 2FA token
    const tokenResult = await generateAndSend2FAToken(
      user.id,
      user.email,
      ipAddress,
      userAgent,
    );

    if (!tokenResult.success) {
      return NextResponse.json(
        { success: false, error: tokenResult.error },
        { status: 500 },
      );
    }

    // Return success with user info (no sensitive data)
    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        requiresEmailVerification: true,
        tokenExpiry: tokenResult.expiresAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("[API] Super admin validation error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
