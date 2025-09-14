"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Filter, Grid3X3, Heart } from "lucide-react";

import { getUserFavoritesAction } from "@/lib/actions/favourites";
import { Separator } from "@/components/ui/separator";
import UnitCard from "@/app/(landing)/projects/[slug]/units/_components/UnitCard";

// Unit type for UnitCard component
interface FavoriteUnit {
  id: string;
  title: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  orientation: string;
  price: string;
  type: string;
  image: string;
  available: boolean;
  statusIcon: boolean | string;
  isFavorite?: boolean;
  projectSlug?: string;
}

const FavoritesPage = () => {
  const [favoriteUnits, setFavoriteUnits] = useState<FavoriteUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<FavoriteUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedRooms, setSelectedRooms] = useState<string>("all");
  const [selectedNew, setSelectedNew] = useState<string>("all");
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<string>("all");

  // Load favorite units from server
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      try {
        const result = await getUserFavoritesAction();
        if (result.success && result.data) {
          const transformedUnits: FavoriteUnit[] = (
            result.data as { favorites: unknown[] }
          ).favorites.map(
            (unit: {
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
            }) => ({
              id: unit.id,
              title: `${unit.project.name} - ${unit.unitNumber}`,
              description:
                unit.description ||
                `${unit.unitType} en ${unit.project.neighborhood || unit.project.address}`,
              bedrooms: unit.bedrooms,
              bathrooms: unit.bathrooms,
              area: `${unit.totalArea}m²`,
              orientation: "Norte", // Default value, adjust based on your data
              price: `$${unit.price.toLocaleString()}`,
              type: unit.unitType,
              image: "/project-default.png", // Default image, adjust based on your data
              available: unit.status === "available",
              statusIcon: unit.status === "available",
              isFavorite: true,
              projectSlug: unit.project.slug,
            }),
          );
          setFavoriteUnits(transformedUnits);
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Filter units based on selected filters
  useEffect(() => {
    let filtered = favoriteUnits;

    // Filter by rooms
    if (selectedRooms !== "all") {
      if (selectedRooms === "4+") {
        filtered = filtered.filter((unit) => unit.bedrooms >= 4);
      } else {
        filtered = filtered.filter(
          (unit) => unit.bedrooms === parseInt(selectedRooms),
        );
      }
    }

    // Filter by new construction (available status)
    if (selectedNew !== "all") {
      filtered = filtered.filter((unit) =>
        selectedNew === "true" ? unit.available : !unit.available,
      );
    }

    // Filter by type (using unit type instead of neighborhood)
    if (selectedNeighborhood !== "all") {
      filtered = filtered.filter((unit) => unit.type === selectedNeighborhood);
    }

    setFilteredUnits(filtered);
  }, [favoriteUnits, selectedRooms, selectedNew, selectedNeighborhood]);

  // Loading state component
  const LoadingState = () => (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-[547px] rounded-3xl bg-gray-200"></div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <Heart className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="mb-4 text-2xl font-semibold text-gray-800">
        No tienes unidades favoritas
      </h3>
      <p className="mb-8 max-w-md text-lg text-gray-600">
        Explora nuestros proyectos y marca como favoritas las unidades que más
        te interesen.
      </p>
      <Link
        href="/projects"
        className="bg-primaryColor inline-flex items-center gap-2 rounded-full px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Ver Proyectos
        <Grid3X3 className="h-5 w-5 ml-2" />
      </Link>
    </div>
  );

  return (
    <section className="bg-white pt-26">
      <div className="container mx-auto">
        {/* Hero Section */}
        <div className="mb-4 flex w-full items-center justify-between gap-8">
          <h1 className="dashboard-title">Favoritos</h1>
        </div>

        {/* Content Section */}
        <div>
          {isLoading ? (
            <LoadingState />
          ) : favoriteUnits.length === 0 ? (
            <EmptyState />
          ) : filteredUnits.length === 0 ? (
            <div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50">
                  <Filter className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-gray-800">
                  No se encontraron unidades
                </h3>
                <p className="mb-8 max-w-md text-lg text-gray-600">
                  Intenta ajustar los filtros para encontrar unidades que
                  coincidan con tus criterios.
                </p>
              </div>
              <Separator className="my-12" />
              {/* Continue browsing section */}
              <div>
                <div className="text-center">
                  <h3 className="mb-2 text-2xl font-semibold text-gray-800">
                    Buscas mas opciones?
                  </h3>
                  <p className="mb-8 text-lg text-gray-600">
                    Explora todos nuestros proyectos disponibles
                  </p>
                  <Link
                    href="/projects"
                    className="border-primaryColor text-primaryColor hover:bg-primaryColor inline-flex items-center gap-2 rounded-full border px-8 py-3 font-medium transition-colors hover:text-white"
                  >
                    <Grid3X3 className="h-5 w-5" />
                    Ver Todos los Proyectos
                  </Link>
                </div>
              </div>{" "}
            </div>
          ) : (
            <>
              {/* Units Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredUnits.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    projectId={unit.projectSlug || ""}
                  />
                ))}
              </div>

              <Separator className="my-14" />

              {/* Continue browsing section */}
              <div>
                <div className="text-center">
                  <h3 className="mb-2 text-2xl font-semibold text-gray-800">
                    Buscas mas opciones?
                  </h3>
                  <p className="mb-8 text-lg text-gray-600">
                    Explora todos nuestros proyectos disponibles
                  </p>
                  <Link
                    href="/projects"
                    className="border-primaryColor text-primaryColor hover:bg-primaryColor inline-flex items-center gap-2 rounded-full border px-8 py-3 font-medium transition-colors hover:text-white"
                  >
                    <Grid3X3 className="h-5 w-5" />
                    Ver Todos los Proyectos
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default FavoritesPage;
