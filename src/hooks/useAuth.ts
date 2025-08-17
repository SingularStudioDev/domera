// =============================================================================
// AUTHENTICATION HOOKS FOR DOMERA PLATFORM
// Custom hooks for session management and role checking
// Created: August 2025
// =============================================================================

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserRoleData } from '@/types/next-auth';
import { hasRole, isAdmin, belongsToOrganization, getUserOrganizationIds } from '@/lib/auth/config';

// =============================================================================
// MAIN AUTH HOOK
// =============================================================================

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
    status,
  };
}

// =============================================================================
// ROLE-BASED HOOKS
// =============================================================================

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: string, organizationId?: string) {
  const { user } = useAuth();
  
  if (!user?.roles) return false;
  
  return hasRole(user.roles, role, organizationId);
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin() {
  const { user } = useAuth();
  
  if (!user?.roles) return false;
  
  return isAdmin(user.roles);
}

/**
 * Hook to check if user belongs to organization
 */
export function useBelongsToOrganization(organizationId: string) {
  const { user } = useAuth();
  
  if (!user?.roles) return false;
  
  return belongsToOrganization(user.roles, organizationId);
}

/**
 * Hook to get user's organization IDs
 */
export function useUserOrganizations() {
  const { user } = useAuth();
  
  if (!user?.roles) return [];
  
  return getUserOrganizationIds(user.roles);
}

/**
 * Hook to get user's primary organization (first one in the list)
 */
export function usePrimaryOrganization() {
  const { user } = useAuth();
  
  if (!user?.roles) return null;
  
  const orgRole = user.roles.find(role => role.organization_id);
  return orgRole?.organizations || null;
}

// =============================================================================
// AUTHORIZATION HOOKS
// =============================================================================

/**
 * Hook to check if user can access resource
 */
export function useCanAccess(requiredRole: string, organizationId?: string) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return { canAccess: false, isLoading: true };
  
  if (!user?.roles) return { canAccess: false, isLoading: false };
  
  // Admin can access everything
  if (isAdmin(user.roles)) return { canAccess: true, isLoading: false };
  
  // Check specific role
  const canAccess = hasRole(user.roles, requiredRole, organizationId);
  
  return { canAccess, isLoading: false };
}

/**
 * Hook to require authentication (redirects if not authenticated)
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);
  
  return { isAuthenticated, isLoading };
}

/**
 * Hook to require specific role (redirects if user doesn't have role)
 */
export function useRequireRole(
  requiredRole: string,
  organizationId?: string,
  redirectTo?: string
) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && user) {
      const hasRequiredRole = hasRole(user.roles, requiredRole, organizationId);
      
      if (!hasRequiredRole) {
        // Determine redirect URL based on user's role
        const redirectUrl = redirectTo || getDefaultRedirectForUser(user.roles);
        router.push(redirectUrl);
      }
    }
  }, [user, isLoading, requiredRole, organizationId, redirectTo, router]);
  
  const hasRequiredRole = user ? hasRole(user.roles, requiredRole, organizationId) : false;
  
  return { hasRole: hasRequiredRole, isLoading };
}

/**
 * Hook to require admin access
 */
export function useRequireAdmin(redirectTo?: string) {
  return useRequireRole('admin', undefined, redirectTo);
}

// =============================================================================
// ORGANIZATION HOOKS
// =============================================================================

/**
 * Hook to require organization membership
 */
export function useRequireOrganization(organizationId: string, redirectTo?: string) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && user) {
      const belongsToOrg = belongsToOrganization(user.roles, organizationId);
      
      if (!belongsToOrg) {
        const redirectUrl = redirectTo || getDefaultRedirectForUser(user.roles);
        router.push(redirectUrl);
      }
    }
  }, [user, isLoading, organizationId, redirectTo, router]);
  
  const belongsToOrg = user ? belongsToOrganization(user.roles, organizationId) : false;
  
  return { belongsToOrganization: belongsToOrg, isLoading };
}

/**
 * Hook to get user's role in specific organization
 */
export function useOrganizationRole(organizationId: string) {
  const { user } = useAuth();
  
  if (!user?.roles) return null;
  
  const orgRole = user.roles.find(role => role.organization_id === organizationId);
  return orgRole?.role || null;
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to get user's highest priority role
 */
export function useUserRole() {
  const { user } = useAuth();
  
  if (!user?.roles || user.roles.length === 0) return 'user';
  
  const rolePriority = {
    'admin': 1,
    'organization_owner': 2,
    'sales_manager': 3,
    'finance_manager': 4,
    'site_manager': 5,
    'professional': 6,
    'user': 7,
  };
  
  const highestRole = user.roles.reduce((highest, current) => {
    const currentPriority = rolePriority[current.role] || 999;
    const highestPriority = rolePriority[highest] || 999;
    
    return currentPriority < highestPriority ? current.role : highest;
  }, 'user' as string);
  
  return highestRole;
}

/**
 * Hook to check if user has active operation
 */
export function useHasActiveOperation() {
  // This would need to be implemented with actual API call
  // For now, return false as placeholder
  return false;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getDefaultRedirectForUser(roles: UserRoleData[]): string {
  if (isAdmin(roles)) return '/dashboard';
  
  const hasOrgRole = roles.some(role => 
    ['organization_owner', 'sales_manager', 'finance_manager', 'site_manager'].includes(role.role)
  );
  
  if (hasOrgRole) return '/dashboard';
  
  if (roles.some(role => role.role === 'professional')) {
    return '/professionals/dashboard';
  }
  
  return '/userDashboard';
}