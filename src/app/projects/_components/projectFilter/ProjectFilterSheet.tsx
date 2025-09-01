"use client";

import { useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  minPrice: string;
  maxPrice: string;
  setMinPrice: (price: string) => void;
  setMaxPrice: (price: string) => void;
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
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  updateFilter,
  updatePriceFilter,
  resetAllFilters,
}: ProjectFilterSheetProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [area] = useState([50, 500]);
  const [constructionPercentage] = useState("");
  const [priceRange] = useState([0, 1500000]);

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
      <SheetHeader className="p-6 pt-12 pl-9">
        <SheetTitle className="text-xl font-bold">
          Filtros de búsqueda
        </SheetTitle>
        <SheetDescription>
          Personaliza tu búsqueda de propiedades
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6 px-9">
        {/* Rango de precio */}
        <div>
          <h3 className="mb-3 font-medium text-gray-900">Rango de precio</h3>

          {/* Simple histogram placeholder */}
          <div className="mb-4 flex h-16 items-end justify-center gap-1 rounded bg-gray-100 px-2">
            <div className="bg-primaryColor/20 h-8 w-2"></div>
            <div className="bg-primaryColor/40 h-12 w-2"></div>
            <div className="bg-primaryColor/60 h-16 w-2"></div>
            <div className="bg-primaryColor/80 h-10 w-2"></div>
            <div className="bg-primaryColor h-6 w-2"></div>
            <div className="bg-primaryColor/60 h-4 w-2"></div>
            <div className="bg-primaryColor/40 h-2 w-2"></div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>$USD {priceRange[0].toLocaleString()}</span>
              <span>$USD {priceRange[1].toLocaleString()}</span>
            </div>

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

        {/* Tipo de propiedad */}
        <div>
          <h3 className="mb-3 font-medium text-gray-900">Tipo de propiedad</h3>
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
          <h3 className="mb-3 font-medium text-gray-900">Ubicación</h3>

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

            <Select
              value={currentNeighborhood || "all"}
              onValueChange={(value) => updateFilter("neighborhood", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar barrio" />
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
        </div>

        {/* Habitaciones y Baños */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="mb-3 font-medium text-gray-900">Habitaciones</h3>
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
            <h3 className="mb-3 font-medium text-gray-900">Baños</h3>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{area[0]}m²</span>
              <span>{area[1]}m²</span>
            </div>
            <div className="flex gap-2">
              <Input type="number" placeholder="50" className="flex-1" />
              <Input type="number" placeholder="500" className="flex-1" />
            </div>
          </div>
        </div>

        {/* % de construcción */}
        <div>
          <h3 className="mb-3 font-medium text-gray-900">% de construcción</h3>
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
          <h3 className="mb-3 font-medium text-gray-900">Amenities</h3>
          <div className="grid grid-cols-2 gap-2">
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
                  className="rounded border-gray-300"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <SheetFooter className="mt-6 flex flex-col gap-2 border-t pt-6">
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            onClick={resetAllFilters}
            className="flex-1"
          >
            Resetear
          </Button>
          <Button className="bg-primaryColor hover:bg-primaryColor-hover flex-1">
            Ver resultados (5)
          </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  );
}
