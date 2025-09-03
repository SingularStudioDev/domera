"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  BedIcon,
  CompassIcon,
  Heart,
  RulerIcon,
  ShowerHeadIcon,
} from "lucide-react";

import { toggleFavoriteAction } from "@/lib/actions/favourites";

interface Unit {
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
  unitNumber: string;
  available: boolean;
  statusIcon: boolean | string;
  isFavorite?: boolean;
}

interface UnitCardProps {
  unit: Unit;
  projectSlug: string;
}

export default function UnitCard({ unit, projectSlug }: UnitCardProps) {
  const [isCurrentlyFavorite, setIsCurrentlyFavorite] = useState(
    unit.isFavorite || false,
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
      const result = await toggleFavoriteAction(unit.id);

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
    <div className="group hover:border-primaryColor flex flex-grow flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300">
      <div className="relative">
        <img
          src={`/images/unit-${unit.unitNumber}-main.png`}
          alt={unit.title}
          className="h-64 w-full rounded-t-2xl object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="flex items-center justify-center rounded-2xl bg-gray-200 px-4 py-2 text-sm font-medium text-black">
            {unit.type}
          </span>
          <button
            onClick={handleFavoriteClick}
            className="cursor-pointer rounded-2xl bg-gray-200 px-4 py-2 text-sm font-medium text-black transition-colors duration-300 hover:bg-gray-300"
          >
            {isCurrentlyFavorite ? (
              <Heart fill="#0040ff" className="h-5 w-5 text-blue-600" />
            ) : (
              <Heart className="h-5 w-5 text-black" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4">
          <h4 className="group-hover:text-primaryColor mb-1 text-2xl font-semibold text-black transition duration-300">
            {unit.title}
          </h4>
          <p className="text-black">{unit.description}</p>
        </div>

        <div className="mb-6 flex w-full justify-between pr-10">
          {unit.bedrooms > 0 && (
            <div className="flex items-center gap-2">
              <BedIcon className="h-5 w-5" />
              <div className="text-black">{unit.bedrooms}</div>
            </div>
          )}
          {unit.bathrooms > 0 && (
            <div className="flex items-center gap-2">
              <ShowerHeadIcon className="h-5 w-5" />
              <div className="text-black">{unit.bathrooms}</div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <RulerIcon className="h-5 w-5" />
            <div className="text-black">{unit.area}</div>
          </div>
          <div className="flex items-center gap-2">
            <CompassIcon className="h-5 w-5" />
            <div className="text-black">{unit.orientation}</div>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="mb-1 font-semibold text-black">Precio</p>
            <p className="group-hover:text-primaryColor text-3xl font-bold text-black transition duration-300">
              {unit.price}
            </p>
          </div>

          <Link
            href={`/projects/${projectSlug}/units/${unit.id}`}
            className="border-primaryColor text-primaryColor hover:bg-primaryColor flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium transition-colors hover:text-white"
          >
            Ver mas
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
