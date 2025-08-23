'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  BedIcon,
  ShowerHeadIcon,
  RulerIcon,
  CompassIcon,
  Heart,
} from 'lucide-react';
import { toggleFavoriteAction } from '@/lib/actions/favourites';

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
  available: boolean;
  statusIcon: boolean | string;
  isFavorite?: boolean;
}

interface UnitCardProps {
  unit: Unit;
  projectId: string;
}

export default function UnitCard({ unit, projectId }: UnitCardProps) {
  const [isCurrentlyFavorite, setIsCurrentlyFavorite] = useState(unit.isFavorite || false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update - cambio inmediato
    const previousState = isCurrentlyFavorite;
    const newState = !isCurrentlyFavorite;
    setIsCurrentlyFavorite(newState);

    console.log(`[FAVORITE] Optimistic update: ${previousState} -> ${newState} for unit ${unit.id}`);

    // Procesar backend en segundo plano
    try {
      const result = await toggleFavoriteAction(unit.id);
      console.log(`[FAVORITE] Server response:`, result);
      
      if (result.success) {
        // El servidor procesó correctamente - mantener el nuevo estado
        console.log(`[FAVORITE] Success: keeping state as ${newState}`);
      } else {
        // Error del servidor - revertir
        console.log(`[FAVORITE] Error: reverting to ${previousState}`);
        setIsCurrentlyFavorite(previousState);
        console.error('Error toggling favorite:', result.error);
      }
    } catch (error) {
      // Error de red - revertir
      console.log(`[FAVORITE] Network error: reverting to ${previousState}`);
      setIsCurrentlyFavorite(previousState);
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="group hover:border-primaryColor overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300">
      <div className="relative">
        <Image
          src={unit.image}
          alt={unit.title}
          width={414}
          height={267}
          className="h-64 w-full rounded-t-2xl object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="flex items-center justify-center rounded-2xl bg-gray-200 px-4 py-2 text-sm font-medium text-black">
            {unit.type}
          </span>
          <button 
            onClick={handleFavoriteClick}
            className="rounded-2xl cursor-pointer bg-gray-200 px-4 py-2 text-sm font-medium text-black hover:bg-gray-300 transition-colors duration-300"
          >
            {isCurrentlyFavorite ? (
              <Heart fill='#0040ff' className="h-5 w-5 text-blue-600" />
            ) : (
              <Heart className="h-5 w-5 text-black" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
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

        <div className="flex items-end justify-between">
          <div>
            <p className="mb-1 font-semibold text-black">Precio</p>
            <p className="group-hover:text-primaryColor text-3xl font-bold text-black transition duration-300">
              {unit.price}
            </p>
          </div>

          <Link
            href={`/projects/${projectId}/units/${unit.id}`}
            className="border-primaryColor text-primaryColor hover:bg-primaryColor flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium transition-colors hover:text-white"
          >
            Comprar
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
