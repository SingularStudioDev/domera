"use client";

import { useEffect, useState } from "react";

import { X } from "lucide-react";

import { getPublicProjectsAction } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import MainButton from "@/components/custom-ui/MainButton";

interface PriceRangeData {
  range: string;
  min: number;
  max: number;
  count: number;
  height: number;
}

interface ProjectFilterSheetProps {
  neighborhoods: string[];
  cities: string[];
  amenities: string[];
  currentNeighborhood: string | null;
  currentCity: string | null;
  currentStatus: string | null;
  currentRooms: string | null;
  currentAmenities: string | null;
  currentMinPrice: string | null;
  currentMaxPrice: string | null;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  areaRange: [number, number];
  setAreaRange: (range: [number, number]) => void;
  updateFilter: (key: string, value: string) => void;
  updatePriceFilter: () => void;
  resetAllFilters: () => void;
}

export default function ProjectFilterSheet({
  neighborhoods,
  cities,
  amenities,
  currentNeighborhood,
  currentCity,
  currentStatus,
  currentRooms,
  priceRange,
  setPriceRange,
  areaRange,
  setAreaRange,
  updateFilter,
  updatePriceFilter,
  resetAllFilters,
}: ProjectFilterSheetProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [constructionPercentage] = useState("");
  const [priceRangeData, setPriceRangeData] = useState<PriceRangeData[]>([]);
  const maxPriceLimit = 1500000;

  // Define price ranges
  const priceRanges = [
    { min: 0, max: 100000, range: "0-100k" },
    { min: 100000, max: 300000, range: "100k-300k" },
    { min: 300000, max: 500000, range: "300k-500k" },
    { min: 500000, max: 700000, range: "500k-700k" },
    { min: 700000, max: 1000000, range: "700k-1M" },
    { min: 1000000, max: 1200000, range: "1M-1.2M" },
    { min: 1200000, max: 1500000, range: "1.2M-1.5M" },
  ];

  // Fetch projects and calculate price distribution
  useEffect(() => {
    const fetchPriceDistribution = async () => {
      try {
        // Fetch all projects without pagination to get full dataset
        const result = await getPublicProjectsAction({
          page: 1,
          pageSize: 1000, // Get all projects
          city: currentCity !== "all" ? currentCity : undefined,
          neighborhood:
            currentNeighborhood !== "all" ? currentNeighborhood : undefined,
          status:
            currentStatus !== "all"
              ? (currentStatus as "pre_sale" | "construction" | "completed")
              : undefined,
        });

        if (result.success && result.data) {
          const projects = result.data.data;

          // Calculate counts for each price range
          const rangeData = priceRanges.map((range) => {
            const count = projects.filter((project) => {
              const price = Number(project.basePrice) || 0;
              return price >= range.min && price < range.max;
            }).length;

            return {
              ...range,
              count,
              height: count, // We'll normalize this below
            };
          });

          // Normalize heights to fit in the 64px container (h-16)
          const maxCount = Math.max(...rangeData.map((r) => r.count));
          const normalizedData = rangeData.map((range) => ({
            ...range,
            height:
              maxCount > 0
                ? Math.max(2, Math.round((range.count / maxCount) * 64))
                : 2,
          }));

          setPriceRangeData(normalizedData);
        }
      } catch (error) {
        console.error("Error fetching price distribution:", error);
      }
    };

    fetchPriceDistribution();
  }, [currentCity, currentNeighborhood, currentStatus]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  return (
    <SheetContent
      side="right"
      className="w-full overflow-y-auto rounded-l-2xl sm:max-w-md"
    >
      <SheetHeader className="p-6 pt-12 pb-0 pl-9">
        <SheetTitle className="text-xl font-bold">
          Filtros de búsqueda
        </SheetTitle>
        <SheetDescription>
          Personaliza tu búsqueda de propiedades
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-3 px-9">
        {/* Rango de precio */}
        <div>
          <h3 className="mb-1 font-medium text-gray-900">Rango de precio</h3>

          {/* Simple histogram placeholder */}
          <div className="mb-1 flex h-16 items-end justify-center gap-1 rounded px-2">
            <div className="bg-primaryColor/20 h-2 w-2"></div>
            <div className="bg-primaryColor/40 h-4 w-2"></div>
            <div className="bg-primaryColor/60 h-6 w-2"></div>
            <div className="bg-primaryColor/80 h-10 w-2"></div>
            <div className="bg-primaryColor h-16 w-2"></div>
            <div className="bg-primaryColor/80 h-12 w-2"></div>
            <div className="bg-primaryColor/60 h-8 w-2"></div>
          </div>

          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={(value) =>
                  setPriceRange(value as [number, number])
                }
                onValueCommit={updatePriceFilter}
                max={maxPriceLimit}
                min={0}
                step={10000}
                className="text-primaryColor w-full"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-black">
              <span>$USD {priceRange[0].toLocaleString()}</span>
              <span>$USD {priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Tipo de propiedad */}
        <div>
          <h3 className="mb-1 font-medium text-gray-900">Tipo de propiedad</h3>
          <Select
            value={currentStatus || "all"}
            onValueChange={(value) => updateFilter("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pre_sale">Pre-venta</SelectItem>
              <SelectItem value="construction">En construcción</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ubicación */}
        <div>
          <h3 className="mb-1 font-medium text-gray-900">Ubicación</h3>

          <div className="space-y-3">
            <Select
              value={currentCity || "all"}
              onValueChange={(value) => updateFilter("city", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar zona" />
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

            {/* Location chips */}
            {currentCity && currentCity !== "all" && (
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-sm">
                  {currentCity}
                  <button
                    onClick={() => updateFilter("city", "all")}
                    className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {currentNeighborhood && currentNeighborhood !== "all" && (
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-sm">
                  {currentNeighborhood}
                  <button
                    onClick={() => updateFilter("neighborhood", "all")}
                    className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Habitaciones y Baños */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="mb-1 font-medium text-gray-900">Habitaciones</h3>
            <Select
              value={currentRooms || "all"}
              onValueChange={(value) => updateFilter("rooms", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5+">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="mb-1 font-medium text-gray-900">Baños</h3>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4+">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Área m² */}
        <div>
          <h3 className="mb-3 font-medium text-gray-900">Área m²</h3>
          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={areaRange}
                onValueChange={(value) =>
                  setAreaRange(value as [number, number])
                }
                max={1000}
                min={10}
                step={10}
                className="text-primaryColor w-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{areaRange[0]}m²</span>
              <span>{areaRange[1]}m²</span>
            </div>
          </div>
        </div>

        {/* % de construcción */}
        <div>
          <h3 className="mb-1 font-medium text-gray-900">% de construcción</h3>
          <Select value={constructionPercentage || "0"}>
            <SelectTrigger>
              <SelectValue placeholder="0%" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0%</SelectItem>
              <SelectItem value="25">25%</SelectItem>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="75">75%</SelectItem>
              <SelectItem value="100">100%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="mb-1 font-medium text-gray-900">Amenities</h3>
          <div className="grid grid-cols-2 gap-1">
            {(amenities.length > 0
              ? amenities
              : [
                  "Piscina interior",
                  "Seguridad 24h",
                  "Cocheras techadas",
                  "Lavadero",
                  "Losa radiante",
                  "Gimnasio",
                  "Barbacoa",
                  "Co-Work",
                  "Espacio infantil",
                  "Bicicletero",
                ]
            ).map((amenity) => (
              <label
                key={amenity}
                className="flex items-center space-x-2 text-sm"
              >
                <input
                  type="checkbox"
                  className="cursor-pointer rounded border-gray-300"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <SheetFooter className="mt-4 px-9 pt-0">
        <div className="flex w-full justify-between gap-2">
          <button
            onClick={resetAllFilters}
            className="text-primaryColor cursor-pointer"
          >
            Resetear
          </button>
          <MainButton className="px-4 py-2">Ver resultados</MainButton>
        </div>
      </SheetFooter>
    </SheetContent>
  );
}
