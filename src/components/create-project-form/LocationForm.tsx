"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

import { ExternalLink } from "lucide-react";

import { LocationFormProps } from "@/types/project-form";

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
  const [isEditingMasterPlan, setIsEditingMasterPlan] = useState(false);
  const [newMasterPlanFile, setNewMasterPlanFile] = useState("");

  const handleFieldChange = (field: keyof typeof value, newValue: any) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const addMasterPlanFile = () => {
    if (newMasterPlanFile.trim()) {
      handleFieldChange("masterPlanFiles", [
        ...value.masterPlanFiles,
        newMasterPlanFile.trim(),
      ]);
      setNewMasterPlanFile("");
    }
  };

  const removeMasterPlanFile = (index: number) => {
    const updatedFiles = value.masterPlanFiles.filter((_, i) => i !== index);
    handleFieldChange("masterPlanFiles", updatedFiles);
  };

  return (
    <>
      {/* Modal para editar coordenadas */}
      {isEditingCoordinates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Editar Ubicación</h3>
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
              <button
                onClick={() => setIsEditingCoordinates(false)}
                className="bg-primaryColor hover:bg-primaryColor/90 rounded px-4 py-2 text-white"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditingCoordinates(false)}
                className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar master plan */}
      {isEditingMasterPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Editar Archivos Master Plan
            </h3>

            {/* Agregar nuevo archivo */}
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMasterPlanFile}
                  onChange={(e) => setNewMasterPlanFile(e.target.value)}
                  placeholder="URL del archivo (ej: https://ejemplo.com/masterplan.pdf)"
                  disabled={disabled}
                  className="focus:ring-primaryColor flex-1 rounded border border-gray-300 p-2 outline-none focus:border-transparent focus:ring-2"
                />
                <button
                  onClick={addMasterPlanFile}
                  disabled={disabled || !newMasterPlanFile.trim()}
                  className="bg-primaryColor hover:bg-primaryColor/90 rounded px-4 py-2 text-white disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Lista de archivos existentes */}
            <div className="space-y-2">
              {value.masterPlanFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                >
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 truncate text-sm">{file}</span>
                  <button
                    onClick={() => removeMasterPlanFile(index)}
                    disabled={disabled}
                    className="rounded p-1 text-red-500 hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {value.masterPlanFiles.length === 0 && (
                <p className="p-4 text-center text-sm text-gray-500 italic">
                  No hay archivos de master plan. Usa el campo arriba para
                  agregar.
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setIsEditingMasterPlan(false)}
                className="bg-primaryColor hover:bg-primaryColor/90 rounded px-4 py-2 text-white"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditingMasterPlan(false)}
                className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
                    projectName={projectName}
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
                <div
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
                </div>
              )}
            </div>
          </div>

          {/* MASTER PLAN */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Master plan
            </h3>

            <div className="space-y-3">
              {value.masterPlanFiles.length > 0 ? (
                value.masterPlanFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                  >
                    <ExternalLink className="text-primaryColor h-4 w-4" />
                    <a
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primaryColor flex-1 truncate text-sm hover:underline"
                    >
                      Ver master plan {index + 1}
                    </a>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <div className="mb-2 text-4xl">📋</div>
                  <p className="font-medium">No hay archivos de master plan</p>
                </div>
              )}

              {!disabled && (
                <button
                  onClick={() => setIsEditingMasterPlan(true)}
                  className="hover:border-primaryColor hover:bg-primaryColor/5 hover:text-primaryColor w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-gray-600 transition-colors"
                >
                  + Agregar archivos de master plan
                </button>
              )}
            </div>
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
