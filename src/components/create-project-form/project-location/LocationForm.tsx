"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

import { LocationFormProps } from "@/types/project-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { MasterPlanFilesForm } from "./MasterPlanFilesForm";

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

export function LocationFormComponent({
  value,
  onChange,
  projectName,
  disabled,
  error,
}: LocationFormProps) {
  const [isEditingCoordinates, setIsEditingCoordinates] = useState(false);

  const handleFieldChange = (field: keyof typeof value, newValue: unknown) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  return (
    <>
      {/* Dialog para editar coordenadas */}
      <Dialog
        open={isEditingCoordinates}
        onOpenChange={setIsEditingCoordinates}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Ubicación</DialogTitle>
            <DialogDescription>
              Modifica las coordenadas de latitud y longitud del proyecto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Latitud
              </label>
              <input
                type="number"
                step="any"
                value={value.latitude || ""}
                onChange={(e) =>
                  handleFieldChange(
                    "latitude",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="-34.9011"
                disabled={disabled}
                className="focus:ring-primaryColor w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Longitud
              </label>
              <input
                type="number"
                step="any"
                value={value.longitude || ""}
                onChange={(e) =>
                  handleFieldChange(
                    "longitude",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="-56.1645"
                disabled={disabled}
                className="focus:ring-primaryColor w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              onClick={() => setIsEditingCoordinates(false)}
              className="bg-primaryColor hover:bg-primaryColor/90"
            >
              Guardar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditingCoordinates(false)}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

          {/* MASTER PLAN */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Master plan
            </h3>

            <MasterPlanFilesForm
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
    </>
  );
}
