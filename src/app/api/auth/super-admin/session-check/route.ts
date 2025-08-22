// =============================================================================
// SUPER ADMIN SESSION CHECK API
// Checks if user has valid super admin session
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdminSession } from '@/lib/auth/super-admin';
import { extractRealIP } from '@/lib/utils/security';

export async function GET(request: NextRequest) {
  try {
    // Extract security metadata
    const ipAddress = extractRealIP(request.headers);

    // Get session token from cookie
    const sessionToken = request.cookies.get('super-admin-session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'No hay sesión activa' },
        { status: 401 }
      );
    }

    // Validate session
    const sessionValidation = await validateSuperAdminSession(sessionToken, ipAddress);

    if (!sessionValidation.valid || !sessionValidation.userId) {
      return NextResponse.json(
        { success: false, error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: sessionValidation.userId,
        message: 'Sesión válida'
      }
    });

  } catch (error) {
    console.error('[API] Super admin session check error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}