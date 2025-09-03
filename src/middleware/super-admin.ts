// =============================================================================
// SUPER ADMIN MIDDLEWARE
// Middleware to protect super admin routes
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

import { getToken } from "next-auth/jwt";

export async function superAdminMiddleware(request: NextRequest) {
  try {
    // Get the token from the request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Check if user is authenticated
    if (!token || !token.email) {
      return NextResponse.redirect(new URL("/superLogin", request.url));
    }

    // Check if user has super admin role (admin with null organizationId)
    const roles =
      (token.roles as { role: string; organizationId: string | null }[]) || [];
    const isSuperAdmin = roles.some(
      (role) => role.role === "admin" && role.organizationId === null,
    );

    if (!isSuperAdmin) {
      // Redirect non-super-admin users to main site
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Allow super admin to continue
    return NextResponse.next();
  } catch (error) {
    console.error("Super admin middleware error:", error);
    return NextResponse.redirect(new URL("/superLogin", request.url));
  }
}
