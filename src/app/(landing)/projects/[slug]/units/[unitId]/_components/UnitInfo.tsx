"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Bath,
  Bed,
  Calendar,
  Compass,
  Heart,
  Home,
  Square,
} from "lucide-react";

import { toggleFavoriteAction } from "@/lib/actions/favourites";
import MainButton from "@/components/custom-ui/MainButton";

interface UnitInfoProps {
  unitId: string;
  unitNumber: string;
  unitType: string;
  unitFirstImage?: string;
  floor: number | null;
  facing: string | null;
  orientation: string | null;
  bathrooms: number;
  bedrooms: number;
  area: string;
  completion: string;
  formattedPrice: string;
  isFavorite?: boolean;
  projectId?: string;
  projectName?: string;
  projectHeroImage?: string;
  onAddToCheckout: () => void;
  isAvailable: boolean;
  unitStatus: string;
}

export default function UnitInfo({
  unitId,
  unitNumber,
  unitType,
  unitFirstImage,
  floor,
  facing,
  orientation,
  bathrooms,
  bedrooms,
  area,
  completion,
  formattedPrice,
  isFavorite,
  projectId,
  projectName,
  projectHeroImage,
  onAddToCheckout,
  isAvailable,
  unitStatus,
}: UnitInfoProps) {
  const [isCurrentlyFavorite, setIsCurrentlyFavorite] = useState(
    isFavorite || false,
  );
  const router = useRouter();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update - cambio inmediato
    const previousState = isCurrentlyFavorite;
    const newState = !isCurrentlyFavorite;
    setIsCurrentlyFavorite(newState);

    // Procesar backend en segundo plano
    try {
      const result = await toggleFavoriteAction(unitId);

      if (result.success) {
        // El servidor procesó correctamente - mantener el nuevo estado
      } else {
        // Error del servidor - revertir
        setIsCurrentlyFavorite(previousState);

        // Si es error de autenticación, redirigir al login
        if (
          result.error?.includes("autenticado") ||
          result.error?.includes("sesión")
        ) {
          router.push("/login");
          return;
        }
      }
    } catch (error) {
      // Error de red - revertir
      console.log(`[FAVORITE] Network error: reverting to ${previousState}`);
      setIsCurrentlyFavorite(previousState);
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Unit Title and Info - Takes available space */}
      <div className="flex-1 space-y-6">
        {/* Unit Title and Star */}
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start gap-2">
            {isAvailable && (
              <button
                onClick={handleFavoriteClick}
                className="cursor-pointer rounded-2xl bg-gray-200 p-3 text-sm font-medium text-black transition-colors duration-300 hover:bg-gray-300"
              >
                {isCurrentlyFavorite ? (
                  <Heart fill="#0040ff" className="h-6 w-6 text-blue-600" />
                ) : (
                  <Heart className="h-6 w-6 text-black" />
                )}
              </button>
            )}
            <h1 className="text-4xl font-bold text-black">
              Unidad {unitNumber} - Piso {floor || "N/A"}
            </h1>
            {!isAvailable && (
              <span className={`ml-4 px-4 py-2 rounded-2xl text-sm font-medium text-white ${
                unitStatus === "reserved" ? "bg-orange-500" : unitStatus === "sold" ? "bg-red-500" : "bg-gray-500"
              }`}>
                {unitStatus === "reserved" ? "Reservada" : unitStatus === "sold" ? "Vendida" : "No Disponible"}
              </span>
            )}
          </div>
        </div>

        {/* Unit Details Grid */}
        <div className="space-y-4">
          {/* Location Row */}
          <div className="flex gap-4">
            <div className="flex flex-1 items-center gap-4">
              <Home className="h-5 w-5 text-black" />
              <span className="text-xl text-black">Ubicación:</span>
              <span className="text-xl text-black">
                {facing || orientation || "N/A"}
              </span>
            </div>
          </div>

          {/* Orientation Row */}
          <div className="flex gap-4">
            <div className="flex flex-1 items-center gap-4">
              <Compass className="h-5 w-5 text-black" />
              <span className="text-xl text-black">Orientación:</span>
              <span className="text-xl text-black">{orientation || "N/A"}</span>
            </div>
          </div>

          {/* Bathrooms Row */}
          <div className="flex gap-4">
            <div className="flex flex-1 items-center gap-4">
              <Bath className="h-5 w-5 text-black" />
              <span className="text-xl text-black">Baños:</span>
              <span className="text-xl text-black">{bathrooms}</span>
            </div>
          </div>

          {/* Bedrooms Row */}
          <div className="flex gap-4">
            <div className="flex flex-1 items-center gap-4">
              <Bed className="h-5 w-5 text-black" />
              <span className="text-xl text-black">Dormitorios:</span>
              <span className="text-xl text-black">{bedrooms}</span>
            </div>
          </div>

          {/* Area Row */}
          <div className="flex gap-4">
            <div className="flex flex-1 items-center gap-4">
              <Square className="h-5 w-5 text-black" />
              <span className="text-xl text-black">Área:</span>
              <span className="text-xl text-black">{area}</span>
            </div>
          </div>

          {/* Completion Row */}
          <div className="flex gap-4">
            <div className="flex flex-1 items-center gap-4">
              <Calendar className="h-5 w-5 text-black" />
              <span className="text-xl text-black">Finalización:</span>
              <span className="text-xl text-black">{completion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Section - Always at bottom */}
      <div className={`mt-6 rounded-2xl border py-6 pr-4 pl-6 ${
        isAvailable ? "border-primaryColor" : "border-gray-300"
      }`}>
        <div className="flex items-end justify-between">
          <div className="">
            <p className={`text-xl ${
              isAvailable ? "text-primaryColor" : "text-gray-500"
            }`}>Precio</p>
            <h2 className={`text-3xl font-bold ${
              isAvailable ? "text-primaryColor" : "text-gray-500"
            }`}>
              {formattedPrice}
            </h2>
          </div>

          {isAvailable ? (
            <MainButton variant="fill" showArrow onClick={onAddToCheckout}>
              Comprar
            </MainButton>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
            >
              {unitStatus === "reserved" ? "Reservada" : unitStatus === "sold" ? "Vendida" : "No Disponible"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
