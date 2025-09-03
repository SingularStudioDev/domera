"use client";

import React, { useCallback, useEffect, useState } from "react";

import { Icon } from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

import "leaflet/dist/leaflet.css";

// Fix for default markers in Next.js
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapSelectorProps {
  latitude: number | null;
  longitude: number | null;
  address?: string;
  onChange: (lat: number | null, lng: number | null) => void;
  disabled?: boolean;
}

// Montevideo centro como posición por defecto
const MONTEVIDEO_CENTER: [number, number] = [-34.9045, -56.1917];

interface LocationMarkerProps {
  position: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
}

function LocationMarker({ position, onPositionChange }: LocationMarkerProps) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPositionChange(lat, lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [map, position]);

  return position ? <Marker position={position} /> : null;
}

export function MapSelector({
  latitude,
  longitude,
  address,
  onChange,
  disabled = false,
}: MapSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<
    [number, number] | null
  >(latitude && longitude ? [latitude, longitude] : null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      setCurrentPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handlePositionChange = useCallback(
    (lat: number, lng: number) => {
      setCurrentPosition([lat, lng]);
      onChange(lat, lng);
    },
    [onChange],
  );

  const clearLocation = () => {
    setCurrentPosition(null);
    onChange(null, null);
  };

  // Geocoding simple usando la dirección si está disponible
  const searchByAddress = useCallback(async () => {
    if (!address?.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address + ", Montevideo, Uruguay",
        )}&limit=1`,
      );
      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon } = results[0];
        const newPosition: [number, number] = [
          parseFloat(lat),
          parseFloat(lon),
        ];
        setCurrentPosition(newPosition);
        onChange(parseFloat(lat), parseFloat(lon));
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    }
  }, [address, onChange]);

  if (!mounted) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-lg bg-gray-200">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex flex-wrap gap-2">
        {address && (
          <button
            type="button"
            onClick={searchByAddress}
            disabled={disabled}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Buscar por Dirección
          </button>
        )}

        {currentPosition && (
          <button
            type="button"
            onClick={clearLocation}
            disabled={disabled}
            className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
          >
            Limpiar Ubicación
          </button>
        )}
      </div>

      {/* Información de coordenadas */}
      {currentPosition && (
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-600">
            <strong>Coordenadas:</strong> {currentPosition[0].toFixed(6)},{" "}
            {currentPosition[1].toFixed(6)}
          </p>
        </div>
      )}

      {/* Mapa */}
      <div className="relative">
        <MapContainer
          center={currentPosition || MONTEVIDEO_CENTER}
          zoom={currentPosition ? 15 : 12}
          style={{ height: "400px", width: "100%" }}
          className="rounded-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker
            position={currentPosition}
            onPositionChange={handlePositionChange}
          />
        </MapContainer>

        {/* Overlay de ayuda */}
        {!disabled && (
          <div className="absolute top-2 left-2 z-[1000] rounded-lg bg-white p-2 shadow-md">
            <p className="text-xs text-gray-600">
              📍 Haz clic en el mapa para seleccionar la ubicación
            </p>
          </div>
        )}

        {disabled && (
          <div className="bg-opacity-75 absolute inset-0 z-[1000] flex items-center justify-center bg-gray-200">
            <p className="text-gray-500">Mapa deshabilitado</p>
          </div>
        )}
      </div>
    </div>
  );
}
