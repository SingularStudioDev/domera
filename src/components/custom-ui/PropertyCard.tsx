"use client";

import Image from "next/image";

import { formatCurrency } from "@/utils/utils";
import { Bed, Car } from "lucide-react";

export interface PropertyCardProps {
  imageUrl: string;
  location: string;
  deliveryDate: string;
  progress: number;
  title: string;
  price: string;
  address: string;
  bedrooms: number;
  garages: number;
  actionLabel: string;
  onAction?: () => void;
}

const PropertyCard = ({
  imageUrl,
  location,
  deliveryDate,
  progress,
  title,
  price,
  address,
  bedrooms,
  garages,
  actionLabel,
  onAction,
}: PropertyCardProps) => {
  return (
    <div
      onClick={onAction}
      className="mx-auto w-full max-w-sm cursor-pointer overflow-hidden rounded-xl bg-white shadow-lg"
    >
      {/* Imagen de portada con badges superpuestos */}
      <div className="relative h-48 sm:h-56">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
        />

        {/* Badge de ubicación - izquierda */}
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-800 shadow-sm backdrop-blur-sm">
            {location}
          </span>
        </div>

        {/* Badge de fecha de entrega - derecha */}
        <div className="absolute top-3 right-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-800 shadow-sm backdrop-blur-sm">
            {deliveryDate}
          </span>
        </div>
      </div>

      {/* Contenido de la card */}
      <div className="space-y-4 p-4">
        {/* Sección de progreso */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{progress}% construido</p>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-300 ease-in-out"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        </div>

        {/* Información principal */}
        <div className="space-y-2">
          <h3 className="text-lg leading-tight font-bold text-gray-900">
            {title}
          </h3>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(Number(price))}
          </p>
          <p className="text-sm leading-relaxed text-gray-600">{address}</p>
        </div>

        {/* Íconos de características */}
        <div className="flex items-center gap-4">
          {/* Dormitorios */}
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {bedrooms}
            </span>
          </div>

          {/* Cocheras */}
          <div className="flex items-center gap-1.5">
            <Car className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{garages}</span>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="text- w-full rounded-full border border-green-200 bg-green-50 px-4 py-1 font-medium text-green-700 transition-colors duration-200 hover:border-green-300 hover:bg-green-100">
          {actionLabel}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
