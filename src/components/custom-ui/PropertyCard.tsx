'use client';

import { Bed, Car } from 'lucide-react';
import Image from 'next/image';

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
    <div onClick={onAction} className="w-full cursor-pointer max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Imagen de portada con badges superpuestos */}
      <div className="relative h-48 sm:h-56">
        <img
          src={imageUrl}
          alt={title}
          className="object-cover h-full w-full"
        />
        
        {/* Badge de ubicación - izquierda */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            {location}
          </span>
        </div>
        
        {/* Badge de fecha de entrega - derecha */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            {deliveryDate}
          </span>
        </div>
      </div>

      {/* Contenido de la card */}
      <div className="p-4 space-y-4">
        {/* Sección de progreso */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{progress}% construido</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        </div>

        {/* Información principal */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {title}
          </h3>
          <p className="text-xl font-bold text-gray-900">
            {price}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {address}
          </p>
        </div>

        {/* Íconos de características */}
        <div className="flex items-center gap-4">
          {/* Dormitorios */}
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {bedrooms}
            </span>
          </div>
          
          {/* Cocheras */}
          <div className="flex items-center gap-1.5">
            <Car className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {garages}
            </span>
          </div>
        </div>

        {/* Botón de acción */}
        <div
          className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-medium py-1 px-4 rounded-full transition-colors duration-200 border border-green-200 text- hover:border-green-300"
        >
          {actionLabel}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;