"use client";

import React, { useState } from "react";

import { OptimizedImageUpload } from "./OptimizedImageUpload";

interface ProjectMainImageFormProps {
  value: {
    images: string[];
    name: string;
  };
  onChange: (data: { images: string[] }) => void;
  disabled?: boolean;
  error?: string;
  projectId?: string;
}

export function ProjectMainImageForm({
  value,
  onChange,
  disabled = false,
  error,
  projectId,
}: ProjectMainImageFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleMainImageChange = (imageUrls: string[]) => {
    const newImages = [...value.images];
    
    if (imageUrls.length > 0) {
      // Asegurar que hay al menos 2 posiciones en el array
      if (newImages.length < 2) {
        // Si no hay primera imagen, agregar placeholder vacío
        if (newImages.length === 0) newImages.push("");
        // Agregar la imagen principal en la segunda posición
        newImages.push(imageUrls[0]);
      } else {
        // Reemplazar la segunda imagen (índice 1)
        newImages[1] = imageUrls[0];
      }
    } else {
      // Remover la segunda imagen si existe
      if (newImages.length >= 2) {
        newImages.splice(1, 1);
      }
    }
    
    onChange({ images: newImages });
  };

  return (
    <>
      {/* Modal/Overlay para edición de imagen principal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Imagen Principal del Proyecto
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Panel de selección de imagen */}
              <div>
                <h4 className="text-md mb-3 font-medium">
                  Seleccionar Imagen Principal
                </h4>
                <OptimizedImageUpload
                  value={value.images.length >= 2 && value.images[1] ? [value.images[1]] : []}
                  onChange={handleMainImageChange}
                  entityType="project"
                  maxImages={1}
                  placeholder="Seleccionar imagen principal"
                  aspectRatio="aspect-video"
                  disabled={disabled}
                  showUploadButton={true}
                  projectId={projectId}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Esta imagen aparecerá en las tarjetas de proyecto y será la imagen principal.
                </p>
              </div>

              {/* Panel de preview como ProjectCard */}
              <div>
                <h4 className="text-md mb-3 font-medium">
                  Vista Previa en ProjectCard
                </h4>
                <div className="relative block overflow-hidden border rounded-3xl bg-white transition-shadow duration-300">
                  <div className="group relative h-[300px] overflow-hidden">
                    {value.images.length >= 2 && value.images[1] ? (
                      <img
                        src={value.images[1]}
                        alt={value.name || "Vista previa"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <div className="text-center text-gray-500">
                          <svg
                            className="mx-auto mb-2 h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-sm">No hay imagen seleccionada</p>
                        </div>
                      </div>
                    )}

                    {/* Status Badge simulado */}
                    <div className="absolute top-3 left-3 flex gap-2 text-black">
                      <span className="rounded-2xl bg-white px-4 py-1 text-lg shadow-sm">
                        Pre-venta
                      </span>
                      <span className="rounded-2xl bg-white px-4 py-1 text-lg shadow-sm">
                        2024
                      </span>
                    </div>

                    {/* Simulación de la parte inferior del ProjectCard */}
                    <div className="absolute bottom-0 flex w-full items-end gap-5">
                      <div className="relative flex w-full flex-col gap-2 bg-white py-3 pr-4 pl-6 text-black">
                        <h3 className="w-full bg-white text-2xl font-medium">
                          {value.name || "Nombre del Proyecto"}
                        </h3>
                        <p className="w-full text-lg bg-white">Desde: $XXX.XXX</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-primaryColor hover:bg-primaryColor/90 rounded px-4 py-2 text-white"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card para imagen principal */}
      <div className="rounded-lg h-[567px] max-w-sm border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Imagen Principal</h3>
          {!disabled && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primaryColor hover:bg-primaryColor/90 rounded px-3 py-2 text-sm text-white"
            >
              {value.images.length >= 2 && value.images[1] ? "Cambiar Imagen" : "Agregar Imagen"}
            </button>
          )}
        </div>

        {/* Imagen actual o placeholder */}
        <div className="relative h-48 overflow-hidden rounded-lg border">
          {value.images.length >= 2 && value.images[1] ? (
            <img
              src={value.images[1]}
              alt={value.name || "Imagen principal"}
              className="h-full w-full object-cover cursor-pointer"
              onClick={() => !disabled && setIsEditing(true)}
            />
          ) : (
            <div
              className="flex h-full w-full cursor-pointer items-center justify-center bg-gray-100"
              onClick={() => !disabled && setIsEditing(true)}
            >
              <div className="text-center text-gray-500">
                <svg
                  className="mx-auto mb-2 h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm">Haz clic para seleccionar la imagen principal</p>
                <p className="text-xs text-gray-400 mt-1">
                  Esta imagen aparecerá en las tarjetas de proyecto
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-3 text-xs text-gray-500">
          Recomendado: Imagen en formato horizontal (16:9) y alta calidad para mejores resultados.
        </div>
      </div>
    </>
  );
}