'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/utils/utils';

interface StaticMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
  className?: string;
  markerPopup?: string;
}

// Dynamically import the static map component to avoid SSR issues
const LazyStaticMap = dynamic(() => import('./LeafletStaticMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <p className="text-sm text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  ),
});

export default function StaticMap({
  latitude,
  longitude,
  zoom = 15,
  height = "200px",
  className,
  markerPopup = 'Ubicación del proyecto',
}: StaticMapProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-gray-300',
        className
      )}
      style={{ height }}
    >
      <LazyStaticMap
        latitude={latitude}
        longitude={longitude}
        zoom={zoom}
        markerPopup={markerPopup}
        height={height}
      />
    </div>
  );
}