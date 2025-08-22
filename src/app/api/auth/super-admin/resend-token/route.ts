// =============================================================================
// SUPER ADMIN RESEND 2FA TOKEN API
// Resends 2FA verification token via email
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateAndSend2FAToken } from '@/lib/auth/super-admin';
import { extractRealIP, sanitizeUserAgent } from '@/lib/utils/security';
import { getDbClient } from '@/lib/dal/base';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario es requerido' },
        { status: 400 }
      );
    }

    // Extract security metadata
    const ipAddress = extractRealIP(request.headers);
    const userAgent = sanitizeUserAgent(request.headers.get('user-agent'));

    // Get user information
    const client = getDbClient();
    const user = await client.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          where: { isActive: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verify user is super admin
    const isSuperAdmin = user.userRoles.some(role => 
      role.role === 'admin' && role.organizationId === null
    );

    if (!isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autorizado' },
        { status: 403 }
      );
    }

    // Check rate limiting - allow only 3 resends per 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentResends = await client.securityLog.count({
      where: {
        userIdentifier: user.email,
        eventType: 'SUPER_ADMIN_2FA_TOKEN_SENT',
        timestamp: { gte: fifteenMinutesAgo }
      }
    });

    if (recentResends >= 3) {
      return NextResponse.json(
        { success: false, error: 'Demasiados intentos. Espera 15 minutos antes de solicitar otro código.' },
        { status: 429 }
      );
    }

    // Generate and send new token
    const tokenResult = await generateAndSend2FAToken(
      user.id,
      user.email,
      ipAddress,
      userAgent
    );

    if (!tokenResult.success) {
      return NextResponse.json(
        { success: false, error: tokenResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Nuevo código de verificación enviado',
        tokenExpiry: tokenResult.expiresAt?.toISOString()
      }
    });

  } catch (error) {
    console.error('[API] Super admin resend token error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}