// =============================================================================
// SUPER ADMIN 2FA VERIFICATION API
// Verifies 2FA tokens and completes authentication flow
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verify2FAToken, generateSuperAdminSession } from '@/lib/auth/super-admin';
import { extractRealIP, sanitizeUserAgent } from '@/lib/utils/security';

export async function POST(request: NextRequest) {
  try {
    const { userId, token } = await request.json();

    // Validate input
    if (!userId || !token) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario y token son requeridos' },
        { status: 400 }
      );
    }

    // Validate token format (6 digits)
    if (!/^\d{6}$/.test(token)) {
      return NextResponse.json(
        { success: false, error: 'Token debe ser un código de 6 dígitos' },
        { status: 400 }
      );
    }

    // Extract security metadata
    const ipAddress = extractRealIP(request.headers);
    const userAgent = sanitizeUserAgent(request.headers.get('user-agent'));

    // Verify 2FA token
    const verificationResult = await verify2FAToken(
      userId,
      token,
      ipAddress,
      userAgent
    );

    if (!verificationResult.success) {
      return NextResponse.json(
        { success: false, error: verificationResult.error },
        { status: 401 }
      );
    }

    // Generate super admin session
    const sessionResult = await generateSuperAdminSession(
      userId,
      ipAddress,
      userAgent
    );

    // Set secure session cookie
    const response = NextResponse.json({
      success: true,
      data: {
        userId,
        message: 'Autenticación 2FA exitosa',
        expiresAt: sessionResult.expiresAt.toISOString()
      }
    });

    // Set HTTP-only session cookie
    response.cookies.set('super-admin-session', sessionResult.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 4 * 60 * 60, // 4 hours
      path: '/' // Changed from '/super' to '/' to make it available to API routes
    });

    return response;

  } catch (error) {
    console.error('[API] Super admin 2FA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}