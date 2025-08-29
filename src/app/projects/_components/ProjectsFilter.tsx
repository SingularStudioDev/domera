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
import { Input } from '@/components/ui/input';
import { X, List, MapPin } from 'lucide-react';
import { useState } from 'react';

interface ProjectsFilterProps {
  neighborhoods?: string[];
  cities?: string[];
  amenities?: string[];
  onViewChange?: (view: 'list' | 'map') => void;
  currentView?: 'list' | 'map';
}

/**
 * Client-side filter component for projects
 * Manages URL search parameters for filtering
 */
export default function ProjectsFilter({
  neighborhoods = [],
  cities = [],
  amenities = [],
  onViewChange,
  currentView = 'list',
}: ProjectsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentNeighborhood = searchParams.get('neighborhood');
  const currentCity = searchParams.get('city');
  const currentStatus = searchParams.get('status');
  const currentRooms = searchParams.get('rooms');
  const currentAmenities = searchParams.get('amenities');
  const currentMinPrice = searchParams.get('minPrice');
  const currentMaxPrice = searchParams.get('maxPrice');

  const [minPrice, setMinPrice] = useState(currentMinPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice || '');

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

  const updatePriceFilter = () => {
    const params = new URLSearchParams(searchParams);
    
    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }
    
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }
    
    params.delete('page');
    router.push(`/projects?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    router.push('/projects');
  };

  const hasActiveFilters = currentNeighborhood || currentCity || currentStatus || currentRooms || currentAmenities || currentMinPrice || currentMaxPrice;

  return (
    <div className="mb-8 rounded-lg border bg-gray-50 p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        
        {/* View Toggle Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border bg-white p-1">
            <Button
              variant={currentView === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange?.('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Lista
            </Button>
            <Button
              variant={currentView === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange?.('map')}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Mapa
            </Button>
          </div>
          
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
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

        {/* Rooms Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Habitaciones
          </label>
          <Select
            value={currentRooms || 'all'}
            onValueChange={(value) => updateFilter('rooms', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Cualquier cantidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier cantidad</SelectItem>
              <SelectItem value="1">1 habitación</SelectItem>
              <SelectItem value="2">2 habitaciones</SelectItem>
              <SelectItem value="3">3 habitaciones</SelectItem>
              <SelectItem value="4">4 habitaciones</SelectItem>
              <SelectItem value="5+">5+ habitaciones</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amenities Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Amenities
          </label>
          <Select
            value={currentAmenities || 'all'}
            onValueChange={(value) => updateFilter('amenities', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los amenities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los amenities</SelectItem>
              {amenities.map((amenity) => (
                <SelectItem key={amenity} value={amenity}>
                  {amenity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Rango de precio (USD)
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Mín"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={updatePriceFilter}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Máx"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={updatePriceFilter}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}