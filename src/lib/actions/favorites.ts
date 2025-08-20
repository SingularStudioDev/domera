// =============================================================================
// FAVORITES SERVER ACTIONS
// Business logic for managing user favorite units
// =============================================================================

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface FavoriteResult {
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
export async function addToFavorites(unitId: string): Promise<FavoriteResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Check if unit exists and is available
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: {
        id: true,
        unitNumber: true,
        status: true,
        project: { select: { name: true } },
      },
    });

    if (!unit) {
      return {
        success: false,
        error: 'Unidad no encontrada',
      };
    }

    // Check if already favorited
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_unitId: {
          userId: session.user.id,
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
    const favorite = await prisma.userFavorite.create({
      data: {
        userId: session.user.id,
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

    revalidatePath('/favorites');
    revalidatePath('/projects');

    return {
      success: true,
      data: {
        message: `${unit.project.name} - ${unit.unitNumber} agregado a favoritos`,
        favorite,
      },
    };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Remove a unit from user's favorites
 */
export async function removeFromFavorites(
  unitId: string
): Promise<FavoriteResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Check if favorite exists
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_unitId: {
          userId: session.user.id,
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
    await prisma.userFavorite.delete({
      where: {
        userId_unitId: {
          userId: session.user.id,
          unitId: unitId,
        },
      },
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
    console.error('Error removing from favorites:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Toggle favorite status (add if not favorite, remove if favorite)
 */
export async function toggleFavorite(unitId: string): Promise<FavoriteResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Check current favorite status
    const isFavorite = await checkIsFavorite(unitId);

    if (isFavorite) {
      return await removeFromFavorites(unitId);
    } else {
      return await addToFavorites(unitId);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Check if a unit is favorited by current user
 */
export async function checkIsFavorite(unitId: string): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return false;
    }

    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_unitId: {
          userId: session.user.id,
          unitId: unitId,
        },
      },
    });

    return !!favorite;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}

/**
 * Get all user favorites with full unit details
 */
export async function getUserFavorites(): Promise<FavoriteResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: session.user.id },
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
      totalArea: Number(fav.unit.totalArea || 0),
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
    console.error('Error fetching user favorites:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Get favorite statistics for current user
 */
export async function getFavoriteStats(): Promise<FavoriteResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const stats = await prisma.userFavorite.aggregate({
      where: { userId: session.user.id },
      _count: { id: true },
    });

    // Get favorites by project
    const favoritesByProject = await prisma.userFavorite.groupBy({
      by: ['unitId'],
      where: { userId: session.user.id },
      _count: { unitId: true },
      orderBy: { _count: { unitId: 'desc' } },
    });

    // Get project details for favorites
    const projectStats = await prisma.project.findMany({
      where: {
        units: {
          some: {
            favoritedBy: {
              some: { userId: session.user.id },
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
                  some: { userId: session.user.id },
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
    console.error('Error fetching favorite stats:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Get multiple favorite statuses for units (for efficient checking)
 */
export async function getMultipleFavoriteStatus(
  unitIds: string[]
): Promise<Record<string, boolean>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {};
    }

    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId: session.user.id,
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
    console.error('Error checking multiple favorite statuses:', error);
    return {};
  }
}
