"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

import { CreateProjectLocationProps } from "@/types/project-form";

import { CreateProjectMasterPlanFiles } from "../project-masterplans/CreateProjectMasterPlanFiles";
import { EditLocationDialog } from "./EditLocationDialog";

// Importar el mapa de manera dinámica para evitar problemas con SSR
const InteractiveMap = dynamic(
  () => import("@/components/custom-ui/InteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full animate-pulse rounded-lg bg-gray-100 md:h-[500px]" />
    ),
  },
);

export function CreateProjectLocation({
  value,
  onChange,
  projectName,
  disabled,
  error,
}: CreateProjectLocationProps) {
  const [isEditingCoordinates, setIsEditingCoordinates] = useState(false);

  const handleFieldChange = (field: keyof typeof value, newValue: unknown) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  return (
    <>
      {/* Componente principal - EXACTAMENTE igual al original ProjectLocation */}
      <div className="py-5">
        <div className="grid gap-8 md:grid-cols-2">
          {/* UBICACIÓN */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Ubicación
            </h3>

            {/* Mapa */}
            <div className="relative">
              {value.latitude && value.longitude ? (
                <div
                  className="cursor-pointer"
                  onClick={() => !disabled && setIsEditingCoordinates(true)}
                >
                  <InteractiveMap
                    latitude={value.latitude}
                    longitude={value.longitude}
                    markerPopup={projectName}
                    className="h-[200px] w-full rounded-lg md:h-[500px]"
                  />
                  {/* Overlay para indicar que es editable */}
                  {!disabled && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-all duration-200 hover:bg-black/10">
                      <div className="rounded-lg bg-white/90 px-4 py-2 font-medium text-gray-900 opacity-0 hover:opacity-100">
                        Haz clic para editar coordenadas
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className="flex h-[200px] w-full cursor-pointer items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200 md:h-[500px]"
                  onClick={() => !disabled && setIsEditingCoordinates(true)}
                >
                  <div className="text-center text-gray-500">
                    <div className="mb-2 text-4xl">📍</div>
                    <p className="font-medium">Ubicación no disponible</p>
                    {!disabled && (
                      <p className="text-sm">
                        Haz clic para agregar coordenadas
                      </p>
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* TODO: Esto tiene que estar en el form main no en este lugar */}
          {/* MASTER PLAN */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Master plan
            </h3>

            <CreateProjectMasterPlanFiles
              value={value.masterPlanFiles}
              onChange={(files) => handleFieldChange("masterPlanFiles", files)}
              disabled={disabled}
              maxFiles={10}
              placeholder="Agregar archivos de Master Plan"
              className=""
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Dialog para editar coordenadas */}
      <EditLocationDialog
        isOpen={isEditingCoordinates}
        onOpenChange={setIsEditingCoordinates}
        latitude={value.latitude}
        longitude={value.longitude}
        onLatitudeChange={(latitude) => handleFieldChange("latitude", latitude)}
        onLongitudeChange={(longitude) =>
          handleFieldChange("longitude", longitude)
        }
        disabled={disabled}
      />
    </>
  );
}
