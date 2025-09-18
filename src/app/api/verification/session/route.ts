// =============================================================================
// VERIFICATION SESSION ENDPOINT
// API endpoint for creating verification sessions
// =============================================================================

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { validateSession } from "@/lib/auth/validation";
import { createVerificationSession as createSessionDAL } from "@/lib/dal/verification";
import { createVerificationSession } from "@/lib/services/didit";
import { extractRealIP } from "@/lib/utils/security";

// =============================================================================
// TYPES
// =============================================================================

interface CreateSessionRequest {
  callbackUrl?: string;
  features?: string[];
}

interface CreateSessionResponse {
  success: boolean;
  data?: {
    sessionId: string;
    verificationUrl: string;
    status: string;
  };
  error?: string;
}

// =============================================================================
// SESSION CREATION ENDPOINT
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<CreateSessionResponse>> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Get request headers for audit
    const headersList = await headers();
    const ipAddress = extractRealIP(headersList);
    const userAgent = headersList.get("User-Agent");

    // Parse request body
    let requestData: CreateSessionRequest = {};
    try {
      const body = await request.text();
      if (body) {
        requestData = JSON.parse(body);
      }
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: "Formato de solicitud inválido" },
        { status: 400 }
      );
    }

    // Check if user already has a pending verification session
    // TODO: Implement check for existing pending sessions if needed
    // const existingSessionResult = await getLatestVerificationSession(user.id);

    // Create verification session with Didit
    const diditResponse = await createVerificationSession(
      user.id,
      requestData.callbackUrl
    );

    // Store session in database
    const sessionResult = await createSessionDAL(
      user.id,
      diditResponse.session_id,
      diditResponse.session_token,
      diditResponse.verification_url,
      ipAddress,
      userAgent
    );

    if (!sessionResult.data) {
      console.error("Failed to store verification session:", sessionResult.error);
      return NextResponse.json(
        { success: false, error: "Error creando sesión de verificación" },
        { status: 500 }
      );
    }


    return NextResponse.json({
      success: true,
      data: {
        sessionId: diditResponse.session_id,
        verificationUrl: diditResponse.verification_url,
        status: diditResponse.status,
      },
    });

  } catch (error) {
    console.error("Error creating verification session:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === "VerificationError") {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
      if (error.name === "DiditApiError") {
        return NextResponse.json(
          { success: false, error: "Error en el servicio de verificación" },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET SESSION STATUS
// =============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Get user verification info
    // TODO: Implement getUserVerificationInfo from DAL
    // const verificationInfo = await getUserVerificationInfo(user.id);

    return NextResponse.json({
      success: true,
      data: {
        isVerified: false, // placeholder
        status: "NOT_STARTED", // placeholder
      },
    });

  } catch (error) {
    console.error("Error getting verification status:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// =============================================================================
// METHOD NOT ALLOWED
// =============================================================================

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}