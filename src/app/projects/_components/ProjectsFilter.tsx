'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProjectsFilterProps {
  neighborhoods?: string[];
  cities?: string[];
}

/**
 * Client-side filter component for projects
 * Manages URL search parameters for filtering
 */
export default function ProjectsFilter({
  neighborhoods = [],
  cities = [],
}: ProjectsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentNeighborhood = searchParams.get('neighborhood');
  const currentCity = searchParams.get('city');
  const currentStatus = searchParams.get('status');

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value === 'all' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Reset to first page when filtering
    params.delete('page');
    
    router.push(`/projects?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/projects');
  };

  const hasActiveFilters = currentNeighborhood || currentCity || currentStatus;

  return (
    <div className="mb-8 rounded-lg border bg-gray-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* City Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Ciudad
          </label>
          <Select
            value={currentCity || 'all'}
            onValueChange={(value) => updateFilter('city', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las ciudades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ciudades</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Neighborhood Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Barrio
          </label>
          <Select
            value={currentNeighborhood || 'all'}
            onValueChange={(value) => updateFilter('neighborhood', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los barrios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los barrios</SelectItem>
              {neighborhoods.map((neighborhood) => (
                <SelectItem key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Estado
          </label>
          <Select
            value={currentStatus || 'all'}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pre_sale">Pre-venta</SelectItem>
              <SelectItem value="construction">En construcción</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}