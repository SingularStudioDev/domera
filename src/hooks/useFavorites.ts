// =============================================================================
// TYPES AND INTERFACES FOR FRONTEND INTEGRATION
// Type definitions for favorites system - to be used by frontend developers
// Backend provides the data, frontend uses these types for type safety
// =============================================================================

export interface FavoriteUnit {
  id: string;
  unitNumber: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  totalArea: number;
  unitType: string;
  status: string;
  description?: string;
  project: {
    id: string;
    name: string;
    slug: string;
    address: string;
    neighborhood?: string;
  };
  addedAt: Date;
}

export interface FavoriteStats {
  totalFavorites: number;
  projectsWithFavorites: number;
  favoritesByProject: Array<{
    projectId: string;
    projectName: string;
    favoriteCount: number;
  }>;
}

// =============================================================================
// UTILITY FUNCTIONS FOR FRONTEND DEVELOPERS
// Pure functions to help with data manipulation on the frontend
// =============================================================================

/**
 * Calculate if unit is favorite from favorites list
 * Use this in components that receive favorites as props
 */
export function calculateIsFavorite(unitId: string, favorites: FavoriteUnit[]): boolean {
  return favorites.some(fav => fav.id === unitId);
}

/**
 * Get favorites by project from favorites list
 * Use this in components that receive favorites as props
 */
export function calculateFavoritesByProject(
  projectId: string, 
  favorites: FavoriteUnit[]
): FavoriteUnit[] {
  return favorites.filter(fav => fav.project.id === projectId);
}

/**
 * Calculate favorite statistics from favorites list
 * Use this in components that receive favorites as props
 */
export function calculateFavoriteStats(favorites: FavoriteUnit[]): FavoriteStats {
  const projectCounts = favorites.reduce((acc, fav) => {
    const projectId = fav.project.id;
    acc[projectId] = (acc[projectId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const favoritesByProject = Object.entries(projectCounts).map(([projectId, count]) => {
    const project = favorites.find(fav => fav.project.id === projectId)?.project;
    return {
      projectId,
      projectName: project?.name || 'Unknown',
      favoriteCount: count
    };
  });

  return {
    totalFavorites: favorites.length,
    projectsWithFavorites: Object.keys(projectCounts).length,
    favoritesByProject
  };
}

/**
 * Create favorite status map from favorites list and unit IDs
 * Use this in components that need to check multiple units efficiently
 */
export function createFavoriteStatusMap(
  unitIds: string[], 
  favorites: FavoriteUnit[]
): Record<string, boolean> {
  const favoriteMap: Record<string, boolean> = {};
  
  unitIds.forEach(unitId => {
    favoriteMap[unitId] = favorites.some(fav => fav.id === unitId);
  });

  return favoriteMap;
}