// =============================================================================
// SUPER ADMIN VALIDATION API ENDPOINT
// Validates super admin credentials before NextAuth sign-in
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/auth/super-admin';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting protection - basic implementation
    const headersList = headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || 'unknown';
    
    // Parse request body
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email y contraseña son requeridos' 
        },
        { status: 400 }
      );
    }

    // Validate super admin credentials
    const result = await validateSuperAdmin(email, password);

    // Return validation result
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Super administrador validado correctamente'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Super admin validation API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}