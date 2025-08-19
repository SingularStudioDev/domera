// =============================================================================
// PROJECTS SERVER ACTIONS
// Server actions for project management and sales data
// =============================================================================

'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { ProjectStatus, UnitStatus } from '@prisma/client';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ProjectSalesData {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  status: ProjectStatus;
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  averagePrice: number;
  currency: string;
}

export interface PaginatedProjectsResponse {
  projects: ProjectSalesData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =============================================================================
// SERVER ACTIONS
// =============================================================================

/**
 * Get projects with sales statistics and pagination
 */
export async function getProjectsWithSales(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedProjectsResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('Usuario no autenticado');
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.project.count();

    // Get projects with unit statistics
    const projects = await prisma.project.findMany({
      skip: offset,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        units: {
          select: {
            status: true,
            price: true,
          }
        },
        _count: {
          select: {
            units: true
          }
        }
      }
    });

    // Transform data to include sales statistics
    const projectsWithSales: ProjectSalesData[] = projects.map(project => {
      const soldUnits = project.units.filter(unit => unit.status === UnitStatus.sold).length;
      const availableUnits = project.units.filter(unit => unit.status === UnitStatus.available).length;
      
      // Calculate average price from all units
      const totalPrice = project.units.reduce((sum, unit) => sum + Number(unit.price), 0);
      const averagePrice = project.units.length > 0 ? totalPrice / project.units.length : 0;

      return {
        id: project.id,
        name: project.name,
        address: project.address,
        neighborhood: project.neighborhood || 'Sin especificar',
        city: project.city,
        status: project.status,
        totalUnits: project._count.units,
        availableUnits,
        soldUnits,
        averagePrice: Math.round(averagePrice),
        currency: project.currency
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      projects: projectsWithSales,
      total: totalCount,
      page,
      limit,
      totalPages
    };

  } catch (error) {
    console.error('[SERVER_ACTION] Error fetching projects with sales:', error);
    throw new Error('Error al obtener proyectos');
  }
}

/**
 * Get project statistics summary
 */
export async function getProjectsSummary() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('Usuario no autenticado');
    }

    const summary = await prisma.project.aggregate({
      _count: { id: true },
      _sum: { totalUnits: true, availableUnits: true }
    });

    // Get sold units count
    const soldUnitsCount = await prisma.unit.count({
      where: { status: UnitStatus.sold }
    });

    // Get reserved units count
    const reservedUnitsCount = await prisma.unit.count({
      where: { status: UnitStatus.reserved }
    });

    return {
      totalProjects: summary._count.id || 0,
      totalUnits: summary._sum.totalUnits || 0,
      availableUnits: summary._sum.availableUnits || 0,
      soldUnits: soldUnitsCount,
      reservedUnits: reservedUnitsCount
    };

  } catch (error) {
    console.error('[SERVER_ACTION] Error fetching projects summary:', error);
    throw new Error('Error al obtener resumen de proyectos');
  }
}