"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Grid3X3Icon, List, MapIcon, MapPin, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectsFilterProps {
  neighborhoods?: string[];
  cities?: string[];
  amenities?: string[];
  onViewChange?: (view: "list" | "map") => void;
  currentView?: "list" | "map";
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
  currentView = "list",
}: ProjectsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentNeighborhood = searchParams.get("neighborhood");
  const currentCity = searchParams.get("city");
  const currentStatus = searchParams.get("status");
  const currentRooms = searchParams.get("rooms");
  const currentAmenities = searchParams.get("amenities");
  const currentMinPrice = searchParams.get("minPrice");
  const currentMaxPrice = searchParams.get("maxPrice");

  const [minPrice, setMinPrice] = useState(currentMinPrice || "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice || "");

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // Reset to first page when filtering
    params.delete("page");

    router.push(`/projects?${params.toString()}`);
  };

  const updatePriceFilter = () => {
    const params = new URLSearchParams(searchParams);

    if (minPrice) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }

    params.delete("page");
    router.push(`/projects?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    router.push("/projects");
  };

  const hasActiveFilters =
    currentNeighborhood ||
    currentCity ||
    currentStatus ||
    currentRooms ||
    currentAmenities ||
    currentMinPrice ||
    currentMaxPrice;

  return (
    <div className="my-10 flex items-end justify-between">
      {/* Rooms Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Habitaciones
        </label>
        <Select
          value={currentRooms || "all"}
          onValueChange={(value) => updateFilter("rooms", value)}
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
          value={currentAmenities || "all"}
          onValueChange={(value) => updateFilter("amenities", value)}
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

        <Input
          type="number"
          placeholder="Mín"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          onBlur={updatePriceFilter}
          className="flex-1"
        />
      </div>

      {/* Status Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Estado
        </label>
        <Select
          value={currentStatus || "all"}
          onValueChange={(value) => updateFilter("status", value)}
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

      {/* City Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Ciudad
        </label>
        <Select
          value={currentCity || "all"}
          onValueChange={(value) => updateFilter("city", value)}
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
          value={currentNeighborhood || "all"}
          onValueChange={(value) => updateFilter("neighborhood", value)}
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

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => onViewChange?.("list")}
          className={`flex h-10 w-10 cursor-pointer items-center gap-2 rounded-full ${
            currentView === "list"
              ? "bg-primaryColor hover:bg-primaryColor-hover text-white hover:text-white"
              : ""
          }`}
        >
          <Grid3X3Icon className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => onViewChange?.("map")}
          className={`flex h-10 w-10 cursor-pointer items-center gap-2 rounded-full ${
            currentView === "map"
              ? "bg-primaryColor hover:bg-primaryColor-hover text-white hover:text-white"
              : ""
          }`}
        >
          <MapIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
