// =============================================================================
// ORGANIZATION UTILITY FUNCTIONS
// Helper functions for organization display and branding
// =============================================================================

interface Organization {
  id: string;
  name: string;
  logoUrl?: string | null;
}

interface OrganizationDisplayProps {
  organization: Organization;
  className?: string;
}

/**
 * Get organization logo or fallback to name
 */
export function getOrganizationDisplay(organization: Organization) {
  return {
    hasLogo: Boolean(organization.logoUrl),
    logoUrl: organization.logoUrl,
    name: organization.name,
    displayName: organization.name,
  };
}

/**
 * Check if organization has a valid logo URL
 */
export function hasOrganizationLogo(organization: Organization): boolean {
  return Boolean(organization.logoUrl && organization.logoUrl.trim() !== "");
}
