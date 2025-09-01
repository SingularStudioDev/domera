// =============================================================================
// NEXTJS MIDDLEWARE FOR DOMERA PLATFORM
// Handles authentication, authorization, and Supabase session management
// Created: August 2025
// =============================================================================

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { superAdminMiddleware, requiresSuperAdminAccess } from '@/lib/middleware/super-admin';

export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Handle super admin routes with enhanced security
    if (pathname.startsWith('/super')) {
      return await superAdminMiddleware(req);
    }
    
    // Update Supabase session for regular routes
    const response = await updateSession(req);
    
    const token = req.nextauth.token;

    // Define protected routes and their required roles
    const protectedRoutes = {
      '/dashboard': ['admin'],
      '/admin': ['admin'],
      '/organizations': ['admin', 'organization_owner'],
      '/projects/new': ['admin', 'organization_owner', 'sales_manager'],
      '/projects/[id]/edit': ['admin', 'organization_owner', 'sales_manager'],
      '/units/new': ['admin', 'organization_owner', 'sales_manager'],
      '/units/[id]/edit': ['admin', 'organization_owner', 'sales_manager'],
      '/operations': ['admin', 'organization_owner', 'sales_manager', 'finance_manager'],
      '/professionals': ['admin', 'professional'],
      '/userDashboard': ['user'],
    };

    // Check if route is protected
    const matchedRoute = Object.keys(protectedRoutes).find(route => {
      // Simple pattern matching - in production, use a proper route matcher
      const pattern = route.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    });

    if (matchedRoute) {
      const requiredRoles = protectedRoutes[matchedRoute as keyof typeof protectedRoutes];
      
      // Check if user has required role
      const userRoles = token?.roles || [];
      const hasRequiredRole = userRoles.some((role: any) => 
        requiredRoles.includes(role.role)
      );

      if (!hasRequiredRole) {
        // Redirect to appropriate page based on user's highest role
        const userRole = getUserHighestRole(userRoles);
        const redirectUrl = getRedirectUrlForRole(userRole);
        
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public routes that don't require authentication
        const publicRoutes = [
          '/',
          '/projects',
          '/projects/[id]',
          '/login',
          '/super',
          '/register',
          '/api/public',
          '/api/auth',
        ];

        // Routes that require authentication but no specific role
        const authRequiredRoutes = [
          '/checkout',
          '/checkout/additional',
          '/checkout/confirmation',
        ];

        // Check if route is public
        const isPublicRoute = publicRoutes.some(route => {
          const pattern = route.replace(/\[.*?\]/g, '[^/]+');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(pathname);
        });

        if (isPublicRoute) {
          return true;
        }

        // Check if route requires authentication (checkout routes)
        const isAuthRequiredRoute = authRequiredRoutes.some(route => {
          const pattern = route.replace(/\[.*?\]/g, '[^/]+');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(pathname);
        });

        if (isAuthRequiredRoute) {
          return !!token;
        }

        // All other routes require authentication
        return !!token;
      },
    },
  }
);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get user's highest priority role
 */
function getUserHighestRole(userRoles: any[]): string {
  const rolePriority = {
    'admin': 1,
    'organization_owner': 2,
    'sales_manager': 3,
    'finance_manager': 4,
    'site_manager': 5,
    'professional': 6,
    'user': 7,
  };

  if (!userRoles || userRoles.length === 0) return 'user';

  const highestRole = userRoles.reduce((highest, current) => {
    const currentPriority = rolePriority[current.role as keyof typeof rolePriority] || 999;
    const highestPriority = rolePriority[highest as keyof typeof rolePriority] || 999;
    
    return currentPriority < highestPriority ? current.role : highest;
  }, 'user');

  return highestRole;
}

/**
 * Get redirect URL based on user role
 */
function getRedirectUrlForRole(role: string): string {
  switch (role) {
    case 'admin':
    case 'organization_owner':
    case 'sales_manager':
    case 'finance_manager':
    case 'site_manager':
      return '/dashboard';
    case 'professional':
      return '/professionals/dashboard';
    case 'user':
    default:
      return '/userDashboard';
  }
}

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/public|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};