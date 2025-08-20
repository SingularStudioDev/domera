// =============================================================================
// FAVORITES SERVER ACTIONS
// Server actions for favorites management - following single responsibility principle
// Only handles favorites-related operations
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { validateSession } from '@/lib/auth/validation';
import { getUnitById } from '@/lib/dal/units';
import {
  getDbClient,
  logAudit,
  success,
  failure,
  type Result
} from '@/lib/dal/base';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface FavoriteActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface FavoriteUnit {
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

// =============================================================================
// CORE FAVORITES MANAGEMENT
// =============================================================================

/**
 * Add a unit to user's favorites
 */
export async function addToFavoritesAction(unitId: string): Promise<FavoriteActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const client = getDbClient();

    // Check if unit exists using DAL
    const unitResult = await getUnitById(unitId);
    if (!unitResult.data) {
      return {
        success: false,
        error: 'Unidad no encontrada',
      };
    }

    const unit = unitResult.data;

    // Check if already favorited
    const existingFavorite = await client.userFavorite.findUnique({
      where: {
        userId_unitId: {
          userId: user.id,
          unitId: unitId,
        },
      },
    });

    if (existingFavorite) {
      return {
        success: false,
        error: 'Esta unidad ya está en tus favoritos',
      };
    }

    // Add to favorites
    const favorite = await client.userFavorite.create({
      data: {
        userId: user.id,
        unitId: unitId,
      },
      include: {
        unit: {
          include: {
            project: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Log audit
    await logAudit(client, {
      userId: user.id,
      tableName: 'user_favorites',
      recordId: favorite.id,
      action: 'INSERT',
      newValues: { userId: user.id, unitId },
    });

    revalidatePath('/favorites');
    revalidatePath('/projects');

    return {
      success: true,
      data: {
        message: `${unit.project?.name} - ${unit.unitNumber} agregado a favoritos`,
        favorite,
      },
    };
  } catch (error) {
    console.error('[SERVER_ACTION] Error adding to favorites:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error agregando a favoritos',
    };
  }
}

/**
 * Remove a unit from user's favorites
 */
export async function removeFromFavoritesAction(
  unitId: string
): Promise<FavoriteActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const client = getDbClient();

    // Check if favorite exists
    const existingFavorite = await client.userFavorite.findUnique({
      where: {
        userId_unitId: {
          userId: user.id,
          unitId: unitId,
        },
      },
      include: {
        unit: {
          include: {
            project: { select: { name: true } },
          },
        },
      },
    });

    if (!existingFavorite) {
      return {
        success: false,
        error: 'Esta unidad no está en tus favoritos',
      };
    }

    // Remove from favorites
    await client.userFavorite.delete({
      where: {
        userId_unitId: {
          userId: user.id,
          unitId: unitId,
        },
      },
    });

    // Log audit
    await logAudit(client, {
      userId: user.id,
      tableName: 'user_favorites',
      recordId: existingFavorite.id,
      action: 'DELETE',
      oldValues: { userId: user.id, unitId },
    });

    revalidatePath('/favorites');
    revalidatePath('/projects');

    return {
      success: true,
      data: {
        message: `${existingFavorite.unit.project.name} - ${existingFavorite.unit.unitNumber} removido de favoritos`,
      },
    };
  } catch (error) {
    console.error('[SERVER_ACTION] Error removing from favorites:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error removiendo de favoritos',
    };
  }
}

/**
 * Toggle favorite status (add if not favorite, remove if favorite)
 */
export async function toggleFavoriteAction(unitId: string): Promise<FavoriteActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Check current favorite status
    const isFavorite = await checkIsFavoriteAction(unitId);

    if (isFavorite) {
      return await removeFromFavoritesAction(unitId);
    } else {
      return await addToFavoritesAction(unitId);
    }
  } catch (error) {
    console.error('[SERVER_ACTION] Error toggling favorite:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error alternando favorito',
    };
  }
}

/**
 * Check if a unit is favorited by current user
 */
export async function checkIsFavoriteAction(unitId: string): Promise<boolean> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return false;
    }

    const user = authResult.user!;
    const client = getDbClient();

    const favorite = await client.userFavorite.findUnique({
      where: {
        userId_unitId: {
          userId: user.id,
          unitId: unitId,
        },
      },
    });

    return !!favorite;
  } catch (error) {
    console.error('[SERVER_ACTION] Error checking favorite status:', error);
    return false;
  }
}

/**
 * Get all user favorites with full unit details
 */
export async function getUserFavoritesAction(): Promise<FavoriteActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const client = getDbClient();

    const favorites = await client.userFavorite.findMany({
      where: { userId: user.id },
      include: {
        unit: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                slug: true,
                address: true,
                neighborhood: true,
                images: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    // Transform data for easier frontend consumption
    const favoriteUnits: FavoriteUnit[] = favorites.map((fav) => ({
      id: fav.unit.id,
      unitNumber: fav.unit.unitNumber,
      price: Number(fav.unit.price),
      bedrooms: fav.unit.bedrooms,
      bathrooms: fav.unit.bathrooms,
      totalArea: Number(fav.unit.area || 0), // Note: using 'area' as per DAL
      unitType: fav.unit.unitType,
      status: fav.unit.status,
      description: fav.unit.description,
      project: {
        id: fav.unit.project.id,
        name: fav.unit.project.name,
        slug: fav.unit.project.slug,
        address: fav.unit.project.address,
        neighborhood: fav.unit.project.neighborhood,
      },
      addedAt: fav.addedAt,
    }));

    return {
      success: true,
      data: {
        favorites: favoriteUnits,
        count: favoriteUnits.length,
      },
    };
  } catch (error) {
    console.error('[SERVER_ACTION] Error fetching user favorites:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo favoritos del usuario',
    };
  }
}

/**
 * Get favorite statistics for current user
 */
export async function getFavoriteStatsAction(): Promise<FavoriteActionResult> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const user = authResult.user!;
    const client = getDbClient();

    const stats = await client.userFavorite.aggregate({
      where: { userId: user.id },
      _count: { id: true },
    });

    // Get project details for favorites
    const projectStats = await client.project.findMany({
      where: {
        units: {
          some: {
            favoritedBy: {
              some: { userId: user.id },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            units: {
              where: {
                favoritedBy: {
                  some: { userId: user.id },
                },
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: {
        totalFavorites: stats._count.id,
        projectsWithFavorites: projectStats.length,
        favoritesByProject: projectStats.map((p) => ({
          projectId: p.id,
          projectName: p.name,
          favoriteCount: p._count.units,
        })),
      },
    };
  } catch (error) {
    console.error('[SERVER_ACTION] Error fetching favorite stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo estadísticas de favoritos',
    };
  }
}

/**
 * Get multiple favorite statuses for units (for efficient checking)
 */
export async function getMultipleFavoriteStatusAction(
  unitIds: string[]
): Promise<Record<string, boolean>> {
  try {
    // Validate authentication
    const authResult = await validateSession();
    if (!authResult.success) {
      return {};
    }

    const user = authResult.user!;
    const client = getDbClient();

    const favorites = await client.userFavorite.findMany({
      where: {
        userId: user.id,
        unitId: { in: unitIds },
      },
      select: { unitId: true },
    });

    // Create a map of unitId -> isFavorite
    const favoriteMap: Record<string, boolean> = {};

    unitIds.forEach((unitId) => {
      favoriteMap[unitId] = favorites.some((fav) => fav.unitId === unitId);
    });

    return favoriteMap;
  } catch (error) {
    console.error('[SERVER_ACTION] Error checking multiple favorite statuses:', error);
    return {};
  }
}
