"use client";

import React from "react";

import { CoordinatesFormProps } from "@/types/project-form";

export function CoordinatesForm({
  value,
  onChange,
  error,
  disabled = false,
}: CoordinatesFormProps) {
  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const latitude = newValue ? Number(newValue) : null;
    onChange({
      ...value,
      latitude,
    });
  };

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const longitude = newValue ? Number(newValue) : null;
    onChange({
      ...value,
      longitude,
    });
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold text-gray-900">
        Coordenadas del Proyecto
      </h3>
      <p className="mb-6 text-sm text-gray-600">
        Especifica las coordenadas exactas de latitud y longitud del proyecto
        para su ubicación precisa en el mapa.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Latitud */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Latitud
          </label>
          <input
            type="number"
            step="any"
            min="-90"
            max="90"
            value={value.latitude || ""}
            onChange={handleLatitudeChange}
            placeholder="Ej: -34.901112"
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500">
            Valor entre -90 y 90 (formato decimal)
          </p>
        </div>

        {/* Longitud */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Longitud
          </label>
          <input
            type="number"
            step="any"
            min="-180"
            max="180"
            value={value.longitude || ""}
            onChange={handleLongitudeChange}
            placeholder="Ej: -56.164532"
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500">
            Valor entre -180 y 180 (formato decimal)
          </p>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              ¿Cómo obtener las coordenadas?
            </h4>
            <p className="mt-1 text-sm text-blue-700">
              Puedes obtener las coordenadas exactas usando Google Maps: haz
              clic derecho en la ubicación del proyecto y selecciona las
              coordenadas que aparecen en el menú contextual.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
