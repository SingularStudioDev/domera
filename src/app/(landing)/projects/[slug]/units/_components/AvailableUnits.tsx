"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { formatCurrency } from "@/utils/utils";

import { getMultipleFavoriteStatusAction } from "@/lib/actions/favourites";
import { getAvailableUnitsAction } from "@/lib/actions/units";

import UnitCard from "./UnitCard";
import UnitFilter from "./UnitFilter";

interface Unit {
  id: string;
  unitNumber: string;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  totalArea: number | null;
  builtArea: number | null;
  orientation: string | null;
  price: number;
  unitType: string;
  images: string[] | string | null;
  status: string;
  floor: number | null;
  currency: string;
  features: string[] | string | null;
}

interface AvailableUnitsProps {
  projectId: string;
}

export default function AvailableUnits({ projectId }: AvailableUnitsProps) {
  const params = useParams();
  const projectSlug = params.slug as string;

  const [units, setUnits] = useState<Unit[]>([]);
  const [favoriteStatuses, setFavoriteStatuses] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    piso: "Mostrar todo",
    tipologia: "Mostrar todo",
    orientacion: "Mostrar todo",
  });

  useEffect(() => {
    async function fetchUnitsAndFavorites() {
      try {
        setLoading(true);

        // Fetch units
        const unitsResult = await getAvailableUnitsAction(projectId);
        if (!unitsResult.success || !unitsResult.data) {
          setError(unitsResult.error || "Error cargando unidades");
          return;
        }

        const fetchedUnits = unitsResult.data as Unit[];
        setUnits(fetchedUnits);

        // Fetch favorite statuses for all units
        const unitIds = fetchedUnits.map((unit) => unit.id);
        if (unitIds.length > 0) {
          try {
            const favoritesResult =
              await getMultipleFavoriteStatusAction(unitIds);
            setFavoriteStatuses(favoritesResult);
          } catch (favError) {
            // If favorites fail to load, continue without them (user might not be logged in)
            console.log(
              "Could not load favorite statuses (user might not be authenticated)",
            );
            setFavoriteStatuses({});
          }
        }

        setError(null);
      } catch (err) {
        setError("Error inesperado cargando unidades");
        console.error("Error fetching units and favorites:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUnitsAndFavorites();
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-neutral-100 px-4 py-4 md:px-0 md:py-10">
        <div className="container mx-auto py-10">
          {/* Header skeleton */}
          <div className="mb-2 h-9 w-80 animate-pulse rounded bg-gray-300"></div>
          <div className="mb-8 h-6 w-48 animate-pulse rounded bg-gray-300"></div>

          {/* Filter skeleton */}
          <div className="mb-8 flex flex-wrap gap-4">
            <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-300"></div>
            <div className="h-10 w-36 animate-pulse rounded-lg bg-gray-300"></div>
            <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-300"></div>
          </div>

          {/* Unit cards skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                {/* Image skeleton */}
                <div className="relative">
                  <div className="h-64 w-full animate-pulse rounded-t-2xl bg-gray-300"></div>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <div className="h-8 w-20 animate-pulse rounded-2xl bg-gray-400"></div>
                    <div className="h-8 w-12 animate-pulse rounded-2xl bg-gray-400"></div>
                  </div>
                </div>

                {/* Content skeleton */}
                <div className="flex flex-1 flex-col p-4">
                  {/* Title */}
                  <div className="mb-4">
                    <div className="mb-1 h-8 w-32 animate-pulse rounded bg-gray-300"></div>
                  </div>

                  {/* Features skeleton */}
                  <div className="mb-6 flex w-full justify-between pr-10">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-pulse rounded bg-gray-300"></div>
                      <div className="h-5 w-4 animate-pulse rounded bg-gray-300"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-pulse rounded bg-gray-300"></div>
                      <div className="h-5 w-4 animate-pulse rounded bg-gray-300"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-pulse rounded bg-gray-300"></div>
                      <div className="h-5 w-12 animate-pulse rounded bg-gray-300"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-pulse rounded bg-gray-300"></div>
                      <div className="h-5 w-8 animate-pulse rounded bg-gray-300"></div>
                    </div>
                  </div>

                  {/* Price and button skeleton */}
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <div className="mb-1 h-5 w-12 animate-pulse rounded bg-gray-300"></div>
                      <div className="h-9 w-28 animate-pulse rounded bg-gray-300"></div>
                    </div>
                    <div className="h-10 w-24 animate-pulse rounded-full bg-gray-300"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-100 px-4 py-4 md:px-0 md:py-10">
        <div className="container mx-auto py-10">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to safely parse images outside of hooks
  const parseUnitImages = (images: string[] | string | null): string => {
    if (!images) return "/placeholder-unit.jpg";

    // If already an array, return first image
    if (Array.isArray(images)) {
      return images.length > 0 ? images[0] : "/placeholder-unit.jpg";
    }

    // If string, try to parse as JSON
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
        // If not array, treat as single URL
        return images;
      } catch {
        // If parsing fails, treat as single URL
        return images;
      }
    }

    return "/placeholder-unit.jpg";
  };

  // Map real unit data to the format expected by UnitCard
  const mappedUnits = units.map((unit) => ({
    id: unit.id,
    title: `Unidad ${unit.unitNumber}`,
    description: unit.description || "",
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    area: unit.totalArea
      ? `${unit.totalArea} m²`
      : unit.builtArea
        ? `${unit.builtArea} m²`
        : "N/A",
    orientation: unit.orientation || "N/A",
    price: `${unit.currency} ${formatCurrency(unit.price)}`,
    type: unit.unitType,
    image: parseUnitImages(unit.images),
    unitNumber: unit.unitNumber,
    available: unit.status === "available",
    statusIcon: unit.status === "available",
    isFavorite: favoriteStatuses[unit.id] || false,
  }));

  return (
    <div className="bg-neutral-100 px-4 py-4 md:px-0 md:py-10">
      <div className="container mx-auto py-10">
        <h2 className="mb-2 text-3xl font-bold text-black">
          Unidades disponibles
        </h2>
        <p className="mb-8 text-gray-600">
          {mappedUnits.length}{" "}
          {mappedUnits.length === 1
            ? "Unidad disponible"
            : "Unidades disponibles"}
        </p>

        <UnitFilter filters={filters} setFilters={setFilters} />

        {mappedUnits.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mappedUnits.map((unit) => (
              <UnitCard key={unit.id} unit={unit} projectSlug={projectSlug} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-600">
              No hay unidades disponibles para este proyecto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
