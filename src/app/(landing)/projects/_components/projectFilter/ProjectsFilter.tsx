"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Grid3X3Icon, MapIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import MainButton from "@/components/custom-ui/MainButton";

import ProjectFilterSheet from "./ProjectFilterSheet";

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

  const resetAllFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    router.push("/projects");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentNeighborhood) count++;
    if (currentCity) count++;
    if (currentStatus) count++;
    if (currentRooms) count++;
    if (currentAmenities) count++;
    if (currentMinPrice || currentMaxPrice) count++;
    return count;
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
    <div className="flex items-center justify-between gap-4 md:justify-end">
      <div className="flex items-center gap-4">
        {/* Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <MainButton className="px-4 py-1">Filtros</MainButton>
            {/* <Button
              variant="outline"
              className="flex items-center gap-2 relative"
            >
             
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primaryColor text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button> */}
          </SheetTrigger>

          <ProjectFilterSheet
            neighborhoods={neighborhoods}
            cities={cities}
            amenities={amenities}
            currentNeighborhood={currentNeighborhood}
            currentCity={currentCity}
            currentStatus={currentStatus}
            currentRooms={currentRooms}
            currentAmenities={currentAmenities}
            currentMinPrice={currentMinPrice}
            currentMaxPrice={currentMaxPrice}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            updateFilter={updateFilter}
            updatePriceFilter={updatePriceFilter}
            resetAllFilters={resetAllFilters}
          />
        </Sheet>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="mr-1 h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* View Toggle Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => onViewChange?.("list")}
          className={`flex h-9 w-9 cursor-pointer items-center gap-2 rounded-full transition-all duration-300 ${
            currentView === "list"
              ? "bg-primaryColor hover:bg-primaryColor-hover text-white hover:text-white"
              : "text-primaryColor hover:border-primaryColor-hover hover:text-primaryColor-hover border-primaryColor border hover:bg-white"
          }`}
        >
          <Grid3X3Icon className="h-10 w-10" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => onViewChange?.("map")}
          className={`flex h-9 w-9 cursor-pointer items-center gap-2 rounded-full transition-all duration-300 ${
            currentView === "map"
              ? "bg-primaryColor hover:bg-primaryColor-hover text-white hover:text-white"
              : "text-primaryColor hover:border-primaryColor-hover hover:text-primaryColor-hover border-primaryColor border hover:bg-white"
          }`}
        >
          <MapIcon className="h-10 w-10" />
        </Button>
      </div>
    </div>
  );
}
